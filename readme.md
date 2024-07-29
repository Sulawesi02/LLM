# 项目介绍
    随着社会的不断发展，网络语言和用词也在不断更新，变得越来越新潮且难以理解。这一现象在篮球用户评论中尤为明显。设计该系统旨在帮助用户更好地理解主流论坛上的篮球评论背后真实的情感态度。

# 环境配置
    pip install -r requirements.txt

# 目录结构描述
    ├── langServe           // 后端服务
    
    │   ├── static          // 后端静态资源（配置了UI，跟前端一样）
    
    │       ├── assets      // 资源模块
    
    │           ├── css     // 样式
    
    │           └── font    // 阿里巴巴矢量图标库（https://www.iconfont.cn/）
    
    │       ├── index.html  // 页面
    
    │       └── index.js    // js脚本
    
    │   ├── app.py          // 后端服务入口文件
    
    │   └── data.csv        // 数据集
    
    ├── nodeServer          // 前端服务
    
    │   ├── node_modules    // 前端依赖包
    
    │   ├── static          // 前端静态资源
    
    │       ├── assets      // 资源模块
    
    │           ├── css     // 样式
    
    │           └── font    // 阿里巴巴矢量图标库（https://www.iconfont.cn/）
    
    │       ├── index.html  // 页面
    
    │       └── index.js    // js脚本
    
    │   ├── main.js         // 前端服务入口文件
    
    │   └── package.json    // 项目依赖包
    
    ├── .env                // 新建环境变量配置文件（格式：OPENAI_API_KEY = "abcdefg"）
    
    ├── readme.md           // 帮助文档
    
    └── requirements.txt    // 项目依赖库


# 使用说明
1. 克隆项目到本地
2. 安装Miniconda（推荐）或conda
`https://docs.conda.io/en/latest/miniconda.html`
3. 创建并激活虚拟环境
`conda create --name ai_learn_llm python==3.10`
`conda activate ai_learn_llm`
4. 安装依赖库：
`pip install -r requirements.txt`
5. 启动后端服务：
```javascript
cd langServe
python app.py
```
6. 启动前端服务：
```javascript
cd nodeServer
node main.js
```
7. 在浏览器中访问：http://localhost:3000/pages/index.html

# 数据集收集和处理
使用Request技术从虎扑网站上爬取NBA球员的评论数据。爬取内容在系统目录下保存为“data.csv”文件，并标注lable属性（0-负面，0.5-中性，1-正面）

# 前端
前端采用HTML、CSS和JavaScript进行开发，使用node.js的Express框架搭建WEB服务器，允许用户输入评论并显示分析结果。前端静态资源保存在“nodeServer/static”目录下。

前端UI设计包括折叠按钮、展开按钮、新建对话按钮、搜索框、历史对话区域、历史对话项、删除对话图标、聊天记录显示区域、工具栏图标、附件按钮（功能未实现）、输入框、发送按钮。用户可以在输入框中输入评论，点击发送按钮后，前端将调用后端API进行情感分析，并将结果显示在结果展示区。

# 后端
后端采用FastAPI框架，集成LangChain库，提供基于AI模型的API服务。后端服务引入记忆组件和RAG（检索增强生成）技术外加数据文档。后端静态资源保存在“langServe/static”目录下。

# 执行流程
1. 前端启动服务器
前端使用 Express.js 启动服务器，并配置静态文件夹作为服务目录。

2. 前端发送请求
用户在前端界面输入文本点击并发送消息按钮，前端会通过 POST 请求将包含 text 和 session_id 的数据发送到后端（http://127.0.0.1:3000/chain/stream_log）。后端使用conversational_rag_chain进行处理。

3. FastAPI 接收并处理请求
在app.py中定义了启动FastAPI应用的代码，并添加路由、挂载静态文件、CORS 中间件和启动服务器。FastAPI 服务器启动后会接收前端的请求，并使用 add_routes 函数将 conversational_rag_chain 添加到 API 中，这意味着当有请求发送到 /api/chain 路径时，后端将使用这个带消息历史的处理链来处理请求。

4. 返回结果
处理完成后，将结果返回给前端，如果请求成功，后端会返回一个响应，前端可以通过检查 response.ok 属性来确定请求是否成功，并进一步处理响应数据。前端展示处理结果给用户。

# 注意事项
- 请确保在运行项目之前已经安装了所有依赖库
- 本项目仅供学习和研究使用，请勿用于商业用途