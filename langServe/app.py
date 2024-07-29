import os
from dotenv import load_dotenv,find_dotenv
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from langchain_core.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langserve import add_routes
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import CSVLoader
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_community.embeddings import BaichuanTextEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import create_history_aware_retriever,create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# 从.env文件加载环境变量
_ = load_dotenv(find_dotenv())

# 创建模型
llm = ChatOpenAI(
    base_url="https://open.bigmodel.cn/api/paas/v4",
    api_key=os.environ.get('ZHIPUAI_API_KEY'),
    model="glm-4",
)

##### 加载 #####
# 读取文件
file = 'data.csv'
loader = CSVLoader(file_path=file,encoding='utf8')

# 加载文档数据
docs = loader.load()

##### 拆分 #####
# 将文档拆分成块
text_splitter = RecursiveCharacterTextSplitter(chunk_size=400,chunk_overlap=100)
splits = text_splitter.split_documents(docs)

##### 存储 #####
# 为每个块生成向量嵌入
embeddings = HuggingFaceEmbeddings()
# BaichuanTextEmbeddings一直报429错，貌似是因为限流。所以换成HuggingFaceEmbeddings，不需要KEY，不过缺点是慢，启动后端服务得等2分钟左右
# embeddings = BaichuanTextEmbeddings(baichuan_api_key=os.environ["BAICHUAN_API_KEY"])

# 使用 Chroma向量数据库来存储生成向量嵌入
vectorstore = Chroma.from_documents(documents=splits,embedding=embeddings)

##### 检索 #####
# 定义检索器组件
retriever = vectorstore.as_retriever()

##### 增强 #####
### 有语境的问题 ###
contextualize_q_system_prompt = (
    "根据聊天记录和用户最新的问题，"
    "结合聊天记录中的上下文信息和数据集中检索到与输入内容相关的内容，"
    "分析用户输入内容的情感色彩，并判断其是正面、反面还是中性。"
)
contextualize_q_prompt = ChatPromptTemplate.from_messages([
    ("system",contextualize_q_system_prompt),
    MessagesPlaceholder("chat_history"),
    ("human","{input}")
])
history_aware_retriever = create_history_aware_retriever(llm,retriever,contextualize_q_prompt)

### 回答问题 ###
system_prompt = (
    "您是问答任务的助手。"
    "使用检索到的上下文来回答问题。"
    "请尽力回答所有问题。并分析语句的情感,附上情感标签。"
    "\n\n"
    "{context}"
)
qa_prompt = ChatPromptTemplate.from_messages([
    ("system",system_prompt),
    MessagesPlaceholder("chat_history"),
    ("human","{input}")
])
question_answer_chain = create_stuff_documents_chain(llm,qa_prompt)
rag_chain = create_retrieval_chain(history_aware_retriever,question_answer_chain)

##### 生成 #####
# 字典 store 存储对话历史记录
store = {}

def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

conversational_rag_chain = RunnableWithMessageHistory(
    rag_chain,
    get_session_history,
    input_messages_key="input",
    history_messages_key="chat_history",
    output_messages_key="answer"
)

# 定义 FastAPI 应用
app = FastAPI(
    title="LangServe",
    description="使用 LangChain 的 Runnable 接口的简单 API 服务器",
    version="0.0.1"
)

# 添加路由
add_routes(
    app,
    conversational_rag_chain,
    path="/chain",
)

# 挂载静态文件
app.mount("/pages",StaticFiles(directory="static"),name="pages")

# cors跨域
from fastapi.middleware.cors import CORSMiddleware
# 允许所有来源访问，允许所有方法和标头
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],
)

# # 创建提示模板
# prompt_template = ChatPromptTemplate.from_messages([
#     ("system","分析以下文本的情绪:"),
#     ("user","{text}"),
# ])
# # 创建解析器
# parser = StrOutputParser()

# # 创建处理链
# chain = prompt_template | llm | parser

# 启动服务器         
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)

