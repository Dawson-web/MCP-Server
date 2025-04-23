import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
// 模拟面试题数据
const interviewQuestions = {
    javascript: [
        {
            id: 1,
            title: "JavaScript 作用域和闭包",
            difficulty: "中等",
            content: "请解释 JavaScript 中的作用域和闭包概念，并提供一个实际的示例。",
            answer: "作用域是变量的可访问范围。闭包是一个函数和其周围状态的引用的组合。",
            tags: ["JavaScript", "基础概念"],
        },
        {
            id: 2,
            title: "Promise 和异步编程",
            difficulty: "困难",
            content: "解释 Promise 的工作原理，并实现一个简单的 Promise.all() 函数。",
            answer: "Promise 是异步编程的一种解决方案，表示一个异步操作的最终完成或失败。",
            tags: ["JavaScript", "异步编程"],
        },
    ],
    react: [
        {
            id: 3,
            title: "React 生命周期",
            difficulty: "中等",
            content: "详细说明 React 组件的生命周期方法及其使用场景。",
            answer: "React 生命周期包括挂载、更新和卸载三个阶段，每个阶段都有对应的生命周期方法。",
            tags: ["React", "组件"],
        },
    ],
    css: [
        {
            id: 4,
            title: "CSS 布局技术",
            difficulty: "简单",
            content: "比较 Flexbox 和 Grid 布局的异同，并说明它们的适用场景。",
            answer: "Flexbox 适用于一维布局，Grid 适用于二维布局。两者都是现代 CSS 布局的重要技术。",
            tags: ["CSS", "布局"],
        },
    ],
};
// 创建 MCP 服务器实例
const server = new McpServer({
    name: "frontend-interview-server",
    version: "1.0.0",
}, {
    capabilities: {
        prompts: {},
        tools: {},
    },
});
// 获取所有面试题
server.tool("listQuestions", {
    category: z.enum(["javascript", "react", "css"]).optional(),
}, async ({ category }) => {
    const questions = category
        ? interviewQuestions[category]
        : Object.values(interviewQuestions).flat();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(questions, null, 2),
            },
        ],
    };
});
// 根据 ID 获取具体面试题
server.tool("getQuestion", {
    id: z.number(),
}, async ({ id }) => {
    const allQuestions = Object.values(interviewQuestions).flat();
    const question = allQuestions.find((q) => q.id === id);
    if (!question) {
        return {
            content: [
                {
                    type: "text",
                    text: `未找到 ID 为 ${id} 的面试题`,
                },
            ],
        };
    }
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(question, null, 2),
            },
        ],
    };
});
// 根据难度筛选面试题
server.tool("getQuestionsByDifficulty", {
    difficulty: z.enum(["简单", "中等", "困难"]),
}, async ({ difficulty }) => {
    const allQuestions = Object.values(interviewQuestions).flat();
    const filteredQuestions = allQuestions.filter((q) => q.difficulty === difficulty);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(filteredQuestions, null, 2),
            },
        ],
    };
});
// 添加面试准备提示
server.prompt("interviewPrep", {
    category: z.enum(["javascript", "react", "css"]).optional(),
}, async ({ category }) => {
    const tips = category
        ? `以下是准备${category.toUpperCase()}面试的一些建议：\n` +
            `1. 深入理解${category}的核心概念\n` +
            `2. 多做实践练习\n` +
            `3. 准备相关项目经验`
        : "通用面试准备建议：\n" +
            "1. 复习基础知识\n" +
            "2. 准备项目经验\n" +
            "3. 练习算法题\n" +
            "4. 模拟面试";
    return {
        messages: [
            {
                role: "assistant",
                content: {
                    type: "text",
                    text: tips,
                },
            },
        ],
    };
});
// 启动服务器
const transport = new StdioServerTransport();
await server.connect(transport);
