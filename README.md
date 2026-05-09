# TurboWarp 扩展画廊

一个基于 GitHub Pages 的 TurboWarp 扩展画廊网站，用于收集、展示和搜索自定义 TurboWarp 扩展。

## 📁 项目结构

```
extensions/
├── index.html          # 主页面 (搜索，标签，展示）
├── extensions.json     # 扩展数据库 (JSON格式)
├── assets/             # 存放截图图标等
│   ├── extensions/     # 扩展文件 (.js)
│   ├── docs/           # 文档文件 (.html, .md)
│   └── pictures/       # 图标和截图 (.png, .jpg)
└── README.md           # 本文件
```

## 🚀 部署到 GitHub Pages

1. **Fork 或克隆此仓库**

2. **配置你的 GitHub Pages**
   - 进入仓库的 **Settings** → **Pages**
   - Source 选择 `Deploy from a branch`
   - Branch 选择 `main` (或 `master`)，文件夹选择 `/ (root)`
   - 点击 **Save**

3. **添加扩展**
   
   编辑 `extensions.json` 文件，按照以下格式添加新扩展：

   ```json
   {
     "id": "your-ext-id",
     "name": "扩展名称",
     "description": "扩展的简短描述",
     "tags": ["tag1", "tag2"],
     "authors": [
       {
         "name": "作者名",
         "url": "https://github.com/username"
       }
     ],
     "icon": "assets/pictures/your-icon.png",
     "downloadUrl": "https://yourusername.github.io/extensions/assets/extensions/your-ext.js",
     "docsUrl": "https://yourusername.github.io/extensions/assets/docs/your-doc.html",
     "turboWarpUrl": "https://turbowarp.org/editor?extension=https://yourusername.github.io/extensions/assets/extensions/your-ext.js"
   }
   ```

4. **上传资源文件**
   - 将扩展 JS 文件放入 `assets/extensions/`
   - 将图标图片放入 `assets/pictures/`
   - 将文档放入 `assets/docs/`

5. **提交并推送更改**
   ```bash
   git add .
   git commit -m "添加新扩展"
   git push
   ```

6. **访问网站**
   
   等待几分钟后，访问 `https://yourusername.github.io/extensions/` 即可看到你的扩展画廊。

## 📝 JSON 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | ✅ | 扩展的唯一标识符 |
| `name` | string | ✅ | 扩展名称 |
| `description` | string | ✅ | 扩展描述 |
| `tags` | array | ✅ | 标签数组，用于分类和筛选 |
| `authors` | array | ✅ | 作者信息数组，每个作者包含 `name` 和 `url` |
| `icon` | string | ❌ | 图标路径（相对于网站根目录） |
| `downloadUrl` | string | ❌ | 扩展下载链接 |
| `docsUrl` | string | ❌ | 文档链接 |
| `turboWarpUrl` | string | ❌ | 在 TurboWarp 编辑器中打开的链接 |

## 🏷️ 推荐标签

- `math` - 数学相关
- `utility` - 工具类
- `network` - 网络功能
- `graphics` - 图形绘制
- `sound` - 音频处理
- `input` - 输入控制
- `game` - 游戏相关
- `data` - 数据处理

## 🎨 自定义样式

如需修改网站样式，可编辑 `index.html` 中的 `<style>` 部分。主要颜色变量：

```css
:root {
  --bg: #f6f7fb;          /* 背景色 */
  --card-bg: #ffffff;     /* 卡片背景 */
  --text: #1f2937;        /* 文字颜色 */
  --primary: #4f46e5;     /* 主题色 */
  --primary-dark: #3730a3;/* 主题深色 */
}
```

## 📄 许可证

MIT License

## 🔗 相关链接

- [TurboWarp 官网](https://turbowarp.org/)
- [TurboWarp 扩展开发文档](https://docs.turbowarp.org/)
- [GitHub Pages 文档](https://pages.github.com/)
