# Guka Studio - Vercel 部署指南 🚀

本项目是基于 Vite + React 构建的前端单页应用（SPA）。由于使用了 `react-router-dom` 进行客户端路由，部署到 Vercel 非常简单。

## 第一步：准备配置（已完成 ✅）

为了防止用户直接访问某个路由（例如 `/gallery` 或 `/workspace`）时出现 404 错误，我们已经在项目根目录生成了 `vercel.json` 配置文件。
该文件会将所有请求重定向至 `index.html` 交由 React Router 处理：

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 第二步：在 Vercel 导入 GitHub 仓库

1. 注册并登录您的 [Vercel 账号](https://vercel.com/)。
2. 在 Vercel 控制台面板（Dashboard）点击右上角的 **Add New...** -> **Project**。
3. 在左侧的 "Import Git Repository" 大框中，找到您刚刚上传的 `guka-studio` 仓库，点击一旁的 **Import** 按钮。
   > _如果没看到您的仓库，可能需要点击 "Adjust GitHub App Permissions" 授权 Vercel 访问该仓库_。

## 第三步：配置构建选项并部署

在导入页面的 "Configure Project" 面板中，检查以下几项配置是否正确（Vercel 通常会自动识别）：

*   **Framework Preset（框架预设）**: 应该自动识别为 `Vite`。
*   **Build Command（打包命令）**: `npm run build` 
*   **Output Directory（输出目录）**: `dist`
*   **Install Command（安装命令）**: `npm install`（留空使用默认即可）

确认无误后，点击底部的 **Deploy**（部署）按钮。

## 第四步：部署完成 🎉

Vercel 会自动拉取代码 > 安装依赖 (`npm install`) > 打包 (`npm run build`) > 部署到边缘网络。

整个过程大约需要 1~2 分钟。完成后：
1. 您会看到满屏撒花的庆祝界面！🎊
2. 点击 **Continue to Dashboard**。
3. 在控制台的右上角或者 "Domains" 面板中，就可以看到 Vercel 为您分配的免费公网二级域名了（类似于 `guka-studio.vercel.app`）。
4. （可选）如果您有自己的域名，可以在仓库的 **Settings -> Domains** 中添加自定义域名。

## 日后更新代码

经过上述配置后，Vercel 会自动监听您的 GitHub `main` 分支。
日后您如果在本地修改了代码，只需要执行：
```bash
git add .
git commit -m "update"
git push
```
Vercel 就会自动帮您重新打包和更新线上网站，非常方便！
