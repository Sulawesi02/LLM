let sessionId = generateSessionId();
let sessionKey = null;//结束时间

const sidebarNav = document.querySelector(".sidebar-nav");
const sidebar = document.querySelector(".sidebar");
const btnFoldIn = document.querySelector("#btn-fold-in");
const btnFoldOut = document.querySelector("#btn-fold-out");
const btnNew = document.querySelector("#btn-new");
const historyContainer = document.querySelector('.history');
const historicalSessions = document.querySelector('.historical-sessions');
const inputSearchWrapper = document.querySelector(".input-search-wrapper");
const searchIcon = document.querySelector("#search-icon");
const inputSearch = document.querySelector("#input-search");
const today = document.querySelector(".today");
const last7days = document.querySelector(".last-7days");    
const last30days = document.querySelector(".last-30days");

const resLog = document.querySelector("#res-log");

// 点击折叠按钮
btnFoldIn.addEventListener("click", () => {
    sidebar.style.width = 0;
    sidebar.style.padding = 0;
    btnFoldOut.style.display = "inline";
    hideSidebarContent(sidebar);
});

function hideSidebarContent(sidebar) {
    const sidebarContent = sidebar.querySelectorAll('*');
    sidebarContent.forEach(element => {
        element.style.display = 'none';
    });
}

// 点击展开按钮
btnFoldOut.addEventListener("click", () => {
    btnFoldOut.style.display = "none";
    sidebar.style.width = "250px";
    sidebar.style.padding = "12px";
    showSidebarContent();
});

function showSidebarContent() {
    sidebarNav.style.display = 'block';;
    btnFoldIn.style.display = "inline";
    btnNew.style.display = "inline";
    historyContainer.style.display = "block";
    historicalSessions.style.display = "block";
    inputSearchWrapper.style.display = "flex";
    searchIcon.style.display = "flex";
    inputSearch.style.display = "flex";
    today.style.display = "block";
    last7days.style.display = "block";
    last30days.style.display = "block";
    document.querySelectorAll(".title").forEach(function (element) {
        element.style.display = "block";
    });

    document.querySelectorAll(".msg-item").forEach(function (element) {
        element.style.display = "flex";
    });
    document.querySelectorAll(".delete-icon").forEach(function (element) {
        element.style.display = "inline";
        element.innerHTML = `<span class="iconfont icon-shanchu" ></span>`
    });

}

// 新建对话按钮
document.querySelector('#btn-new').addEventListener('click', saveCurrentSession);

// 将点击删除图标和点击会话项的事件委托给 .history 容器
historyContainer.addEventListener('click', function(event) {
    // 检查点击的是否是删除图标
    if (event.target.closest('.delete-icon')) {
        // 找到最近的 .msg-item 祖先元素
        const historyItem = event.target.closest('.msg-item');
        if (historyItem) {
            // 从 data-date 属性获取会话键
            const sessionKey = historyItem.dataset.date;
            // 从localStorage中删除对应的项
            localStorage.removeItem(sessionKey);
            // 从DOM中删除对应的历史对话项
            historyItem.remove();
        }
    }
    // 检查点击的是否是历史对话项本身
    else if (event.target.closest('.msg-item')) {
        const historyItem = event.target.closest('.msg-item');
        if (historyItem) {
            // 获取会话键名
            const sessionKey = historyItem.dataset.date;
            // 调用 loadSession 函数加载会话
            loadSession(sessionKey);
        }
    }
});

// 加载历史聊天记录
function loadSession(key) {
    //从localStorage中加载指定时间的对话数据sessionData
    const sessionData = JSON.parse(localStorage.getItem(key));
    // 在加载对话后，记录对话的key
    sessionKey = key;

    const resLog = (type, text, avatarSrc) => {
        const container = document.createElement("div");
        container.className = `${type}-msg-container`;

        const msgElement = document.createElement("div");
        msgElement.className = `${type}-msg`;
        msgElement.textContent = text;

        const avatar = document.createElement("img");
        avatar.src = avatarSrc;
        avatar.className = "msg-avatar";

        container.appendChild(avatar);
        container.appendChild(msgElement);
        return container;
    };

    sessionData.messages.forEach(msg => {
        const container = createMessageContainer(
            msg.type === "self" ? 'self' : 'llm',
            msg.text,
            msg.type === "self"
                ? 'https://s2.loli.net/2024/07/18/pUmhfObX9R4AQav.png'
                : 'https://s2.loli.net/2024/07/18/adI98XK3C5y2BeG.png'
        );
        resLog.appendChild(container);
    });
}
// 使用模板字符串优化 HTML 创建
const toolbarHTML = `
    <span class="iconfont icon-ic_line_copy24px"></span>
    <span class="iconfont icon-refresh-1-copy"></span>
    <span class="iconfont icon-zhuanfa_2"></span>
    <span class="iconfont icon-24px"></span>
    <span class="iconfont icon-diancai"></span>
`;

// 使用常量存储硬编码的值
const AVATAR_URL_SELF = 'https://s2.loli.net/2024/07/18/pUmhfObX9R4AQav.png';
const AVATAR_URL_LLM = 'https://s2.loli.net/2024/07/18/adI98XK3C5y2BeG.png';

// 如果需要处理搜索框的输入事件，也可以在这个容器上添加
historyContainer.addEventListener('input', function(event) {
    if (event.target.id === 'input-search') {
        const searchText = event.target.value;
        // 根据搜索文本过滤历史对话项
        filterHistorySessions(searchText);
    }
});

// 假设 filterHistorySessions 函数根据搜索文本过滤历史对话项
function filterHistorySessions(searchText) {
    // 获取所有历史对话项
    const msgItems = historyContainer.querySelectorAll('.msg-item');
    // 过滤并显示或隐藏历史对话项
    msgItems.forEach(item => {
        const textContent = item.textContent.toLowerCase();
        if (textContent.includes(searchText.toLowerCase())) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// 输入框回车键发送信息
document.querySelector("#input-chat").addEventListener("keydown", (e) => {
    //按下 Enter 键调用 sendRequest 函数
    if (e.key === 'Enter') {
        sendRequest();
    }
});

// 发送按钮
document.querySelector("#input-send").addEventListener("click", (e) => {
    const inputChat = document.getElementById('input-chat');
    // 检查输入框是否有内容
    if (inputChat.value.trim()) {
        sendRequest();
    } else {
        // 如果没有内容，不执行发送请求，可以在这里给出提示
        alert('请输入消息内容。');
    }
});

/*############################################################ */

// 页面加载完成后执行 initPage 函数
function initPage() {
    //调用 updateHistoryList 函数更新历史对话
    updateHistoryList();
}

// 发送请求函数
function sendRequest(text) {
    // 获取输入框中的文本，如果没有传递参数，则使用输入框的内容
    const inputText = text || document.querySelector("#input-chat").value;
    // 构造数据对象，包括输入的文本和配置
    if (!inputText) return;// 如果没有输入内容，不执行发送请求
    const data = {
        input: {
            input: inputText
        },
        config: {
            "configurable": {
                "session_id": sessionId
            }
        }
    };

    // 在 sendRequest 函数执行期间禁用附件按钮、输入框、发送按钮、新建对话按钮的功能
    const inputAttachment = document.getElementById('input-attachment');
    const inputChat = document.getElementById('input-chat');
    const inputSend = document.getElementById('input-send');
    const btnNew = document.getElementById('btn-new');
    inputAttachment.disabled = true;
    inputChat.disabled = true;
    inputSend.disabled = true;
    btnNew.disabled = true;
    /*
    如果是新发送的消息，创建用于显示用户和LLM响应的消息的div元素
    如果是重新发送的消息，只创建用于LLM响应的消息的div元素
    */

    // 如果是新发送的消息
    if (!text) {
        // 创建用户消息容器的div元素
        const selfMsgContainer = document.createElement("div");
        selfMsgContainer.className = "self-msg-container";

        // 创建用户消息的div元素
        const selfMsg = document.createElement("div");
        selfMsg.innerText = inputText;
        selfMsg.className = "self-msg";

        // 创建用户头像的img元素
        const selfAvatar = document.createElement("img");
        selfAvatar.src = "https://s2.loli.net/2024/07/18/pUmhfObX9R4AQav.png"; // 替换为用户头像的实际 URL
        selfAvatar.className = "self-avatar";

        // 将用户头像和消息元素添加到容器中
        selfMsgContainer.appendChild(selfMsg);
        selfMsgContainer.appendChild(selfAvatar);

        // 将容器添加到聊天记录显示区域
        resLog.appendChild(selfMsgContainer);
    }

    // 创建llm消息容器的div元素
    const llmMsgContainer = document.createElement("div");
    llmMsgContainer.className = "llm-msg-container";

    // 创建llm头像的img元素
    const llmAvatar = document.createElement("img");
    llmAvatar.src = "https://s2.loli.net/2024/07/18/adI98XK3C5y2BeG.png"; // 替换为大模型头像的实际 URL
    llmAvatar.className = "llm-avatar";

    // 创建llm响应消息的div和p元素
    const llmMsg = document.createElement("div");
    llmMsg.className = "llm-msg";
    const llmMsg_P = document.createElement("p");
    llmMsg.appendChild(llmMsg_P);

    // 将llm头像和消息元素添加到容器中
    llmMsgContainer.appendChild(llmAvatar);
    llmMsgContainer.appendChild(llmMsg);

    // 将llm容器添加到聊天记录显示区域
    resLog.appendChild(llmMsgContainer);

    // 删除所有旧的工具栏元素
    const oldToolbars = document.querySelectorAll('.tool-bar');
    oldToolbars.forEach(toolbar => {
        toolbar.remove();
    });

    // 初始化点赞点踩图标状态
    let isLiked = false;
    let isDisliked = false;

    /* 
    使用 fetch 函数发送 POST 请求到服务器
    通过 .then() 方法接收 fetch 的响应结果response
    如果响应状态码为 ok，则继续处理。
    */
    fetch(`/api/chain/stream_log`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    }).then(response => {
        if (response.ok) {
            // 获取响应体的读取器，用于读取响应体的流
            const reader = response.body.getReader();
            // 创建文本解码器
            const decoder = new TextDecoder("utf-8");
            // 获取LLM消息元素中的p标签
            const res = llmMsg_P;
            // 读取函数
            function read() {
                reader.read().then(({ done, value }) => {
                    //如果响应流关闭，则在消息下方添加工具栏
                    if (done) {
                        console.log('Stream closed');
                        // 创建工具栏元素
                        const llmMsg_toolbar = document.createElement("div");
                        llmMsg_toolbar.className = "tool-bar"
                        llmMsg_toolbar.innerHTML = `
                            <span class="iconfont icon-ic_line_copy24px copy-icon"></span>
                            <span class="iconfont icon-refresh-1-copy refresh-icon"></span>
                            <span class="iconfont icon-zhuanfa_2 forward-icon"></span>
                            <span class="iconfont icon-24px like-icon"></span>
                            <span class="iconfont icon-diancai dislike-icon"></span>
                        `

                        // 复制
                        const copyIcon = llmMsg_toolbar.querySelector('.copy-icon');
                        copyIcon.addEventListener('click', () => {
                            // 创建一个临时的textarea元素用于选择和复制文本
                            const tempTextArea = document.createElement('textarea');
                            tempTextArea.value = llmMsg_P.innerText; // 获取要复制的文本
                            document.body.appendChild(tempTextArea);
                            tempTextArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(tempTextArea);
                            alert('文本已复制到剪贴板');
                        });

                        //重新生成
                        const refreshIcon = llmMsg_toolbar.querySelector('.refresh-icon');
                        refreshIcon.addEventListener('click', () => {
                            // 删除llmMsgContainer元素
                            llmMsgContainer.remove();
                            // 重新发送请求获取新的内容
                            sendRequest(inputText);
                        });

                        //转发
                        const forwardIcon = llmMsg_toolbar.querySelector('.forward-icon');
                        forwardIcon.addEventListener('click', () => {
                            const url = window.location.href; // 获取当前页面的URL
                            navigator.clipboard.writeText(url).then(() => {
                                alert('分享链接已复制到剪贴板');
                            });
                        });

                        //点赞
                        const likeIcon = llmMsg_toolbar.querySelector('.like-icon');
                        likeIcon.addEventListener('click', () => {
                            likeIcon.style.color = isLiked ? '' : 'blue'; // 切换颜色
                            isLiked = !isLiked; // 切换点赞状态
                            // 如果点踩状态为真，点击点赞后应取消点踩状态
                            if (isDisliked) {
                                document.querySelector('.iconfont.icon-diancai').style.color = '';
                                isDisliked = false;
                            }
                        });

                        //点踩
                        const dislikeIcon = llmMsg_toolbar.querySelector('.dislike-icon');
                        dislikeIcon.addEventListener('click', () => {
                            dislikeIcon.style.color = isDisliked ? '' : 'blue'; // 切换颜色
                            isDisliked = !isDisliked; // 切换点踩状态
                            // 如果点赞状态为真，点击点踩后应取消点赞状态
                            if (isLiked) {
                                document.querySelector('.iconfont.icon-24px').style.color = '';
                                isLiked = false;
                            }
                        });
                        llmMsg.appendChild(llmMsg_toolbar);

                        // 启用附件按钮、输入框和发送按钮
                        inputAttachment.disabled = false;
                        inputChat.disabled = false;
                        inputSend.disabled = false;
                        btnNew.disabled = false;
                        return;
                    }
                    // 解码响应体
                    const chunk = decoder.decode(value, { stream: true });
                    // console.log(1000,chunk.split('\r\n'))
                    // 遍历每一行
                    chunk.split('\r\n').forEach(eventString => {
                        // console.log(1000,eventString);
                        // 如果行以"data: "开头
                        if (eventString && eventString.startsWith('data: ')) {
                            // console.log(2000,eventString);
                            // 获取data
                            const str = eventString.substring("data: ".length);
                            const data = JSON.parse(str)
                            // console.log(3000,data);
                            // 遍历data中的ops
                            for (const item of data.ops) {
                                if (item.op === "add" && item.path === "/logs/ChatOpenAI/streamed_output_str/-") {
                                    // console.log(item.value)
                                    res.innerHTML += item.value;
                                }
                                if (item.op === "add" && item.path === "/logs/PydanticToolsParser/final_output") {
                                    if (String(item.value.output) !== "null" && String(item.value.output) !== "undefined") {
                                        // console.log(JSON.stringify(item.value.output, null, 2))
                                        res.innerHTML = `<pre>${JSON.stringify(item.value.output, null, 2)}</pre>`;
                                        break;
                                    }
                                }
                            }
                        }
                    });
                    // 递归读取流中的数据，直到流关闭
                    read();
                }).catch(error => {
                    console.error('Stream error', error);
                    // 附件按钮、输入框和发送按钮
                    inputAttachment.disabled = false;
                    inputChat.disabled = false;
                    inputSend.disabled = false;
                    btnNew.disabled = false;

                });
            }
            // 开始读取
            read();
        } else {
            console.error('Network response was not ok.');
            // 启用附件按钮、输入框和发送按钮
            inputAttachment.disabled = false;
            inputChat.disabled = false;
            inputSend.disabled = false;
            btnNew.disabled = false;

        }
    }).catch(error => {
        console.error('Fetch error:', error);
        // 启用附件按钮、输入框和发送按钮
        inputAttachment.disabled = false;
        inputChat.disabled = false;
        inputSend.disabled = false;
        btnNew.disabled = false;

    });
    // 发送请求后清空输入框
    document.getElementById('input-chat').value = '';
}


// 保存当前的聊天记录
function saveCurrentSession() {
    /*
    将聊天记录显示区域中的所有的子元素selfContainer和llmContainer转换成containers数组
    遍历containers数组，使用消息类型（包括self和llm）和文本创建messages数组
    */
    const containers = Array.from(resLog.children).filter(c => c.classList.contains("self-msg-container") || c.classList.contains("llm-msg-container"));
    const messages = containers.map(container => ({
        type: container.classList.contains("self-msg-container") ? "self" : "llm",
        text: container.querySelector(".self-msg, .llm-msg p").textContent,
    }));

    //用self_msg的前10个字符创建一个标签label，用于在历史消息中识别对话
    const label = messages.filter(msg => msg.type === "self")
        .map(msg => msg.text.slice(0, 10))
        .join(", ");

    //创建对话数据
    const sessionData = { messages, label };

    // 获取本地时间
    const now = new Date();
    // 格式化为"YYYY/MM/DD HH:mm:ss"
    const formattedTime = now.toLocaleString("zh-CN", {
        hour12: false,//禁用12h制
        year: 'numeric',//以最短的有效数字表示，不使用前导零
        month: '2-digit',//显示两位数字，不足两位时添零
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    sessionId = generateSessionId();
    // 如果是在原来的对话上继续聊天，则删除旧的对话
    if (sessionKey) {
        // 删除旧的对话
        localStorage.removeItem(sessionKey);
        document.querySelector(`.msg-item[data-date="${sessionKey}"]`).remove();
    }
    // 存储新的对话
    localStorage.setItem(formattedTime, JSON.stringify(sessionData));

    // 清空聊天记录显示区域res-log
    resLog.innerHTML = "";

    // 更新历史消息列表
    updateHistoryList();

    // 清除sessionKey，准备下一次对话
    sessionKey = null;
}

// 更新历史消息列表
function updateHistoryList() {
    const todaySection = document.querySelector(".today");//选取“今天”标题
    const sessionKeys = Object.keys(localStorage);//使用sessionKeys数组存储localStorage中所有的键（格式化的时间戳）
    /* 
    使用map（）函数遍历sessionKeys数组
    将localStorage中的JSON字符串解析成对话数据
    用原始的键名和解析后的对话数据 message 创建 sessions 数组
    */
    const sessions = sessionKeys.map(key => ({ key, ...JSON.parse(localStorage.getItem(key)) }));

    /*
    创建新列表项前，先遍历一遍 sessions 数组
    如果msg-item中不存在对应的列表项，则创建一个新的 div 元素
    设置类名、文本内容、数据属性和事件监听器
    如果点击该列表项，会触发 loadSession 函数，并传入当前对话的键名
    将该列表项插到“今天”标题下的顶部
    */
    sessions.forEach(session => {
        const existingItem = document.querySelector(`.msg-item[data-date="${session.key}"]`);
        if (!existingItem) {
            const historyItem = document.createElement("div");
            historyItem.className = "msg-item";
            historyItem.textContent = session.label;
            historyItem.dataset.date = session.key;
            historyItem.onclick = () => loadSession(session.key);

            // 创建删除图标
            const deleteIcon = document.createElement("span");
            deleteIcon.className = "delete-icon";
            deleteIcon.innerHTML = `<span class="iconfont icon-shanchu" ></span>`


            // 把删除图标添加到历史项的末尾
            historyItem.appendChild(deleteIcon);

            // 把历史项添加到“今天”标题下的顶部
            todaySection.insertBefore(historyItem, todaySection.firstChild);
        }
    });
}


// 添加一个生成 sessionId 的函数
function generateSessionId() {
    // 使用随机字符串、时间戳或其他方法生成 sessionId
    return Math.random().toString(36).substr(2, 9);
}

