# mdspace - Whimsical Infinite Canvas

A Next.js web application featuring infinite nested canvases with markdown boxes and AI integration via MCP.

## Features

- **Infinite Canvas** - Zoomable, pannable canvas with fabric.js v4
- **Nested Canvases** - Double-click any box to create/open a new canvas
- **Markdown Boxes** - Each box supports markdown with live preview (like Obsidian)
- **Hierarchy Navigation** - Visual tree menu for navigating nested canvases
- **AI Integration** - Configure AI providers and chat with AI about box contents
- **MCP Ready** - Architecture supports Model Context Protocol integration
- **Export/Import** - Export boxes as markdown content (import via API)
- **Persistence** - Data stored in IndexedDB for browser persistence

## Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
mdspace/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   ├── ai/             # AI providers & generation
│   │   ├── canvases/       # Canvas CRUD
│   │   ├── export/         # Export .md content
│   │   ├── import/         # Import .md files
│   │   └── mcp/            # MCP integration (stub)
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── components/             # React Components
│   ├── Canvas.tsx         # Fabric.js canvas
│   ├── HierarchyMenu.tsx  # Navigation tree
│   ├── Toolbar.tsx        # Action buttons
│   ├── AIPanel.tsx        # AI chat interface
│   ├── MarkdownEditor.tsx # Markdown editor
│   └── StatusBar.tsx      # Status indicators
├── lib/                    # Libraries
│   ├── db/                # Database (IndexedDB storage)
│   │   ├── index.ts       # CRUD operations
│   │   └── schema.ts      # Type definitions
│   ├── fabric/            # Canvas utilities
│   │   ├── index.ts
│   │   └── setup.ts       # Fabric.js setup
│   ├── mcp/               # MCP Server & Client (stub)
│   │   ├── index.ts
│   │   ├── server.ts
│   │   └── client.ts
│   ├── store/             # Zustand state management
│   │   ├── index.ts
│   │   ├── useCanvasStore.ts
│   │   └── useAIStore.ts
│   └── types.ts           # TypeScript types
├── fabric.d.ts             # Fabric.js type declarations
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Usage

### Creating Canvases and Boxes

1. The app starts with a "Root Canvas" containing a welcome box
2. Click "New Canvas" in the toolbar to create additional canvases
3. Click on empty space on the canvas to add a new box
4. Click and drag boxes to reposition them
5. Use mouse wheel to zoom in/out
6. Right-click and drag to pan around
7. Double-click a box to open it as a new nested canvas
8. Use the hierarchy menu to navigate between canvases

### Editing Box Content

1. Select a box by clicking on it
2. Click "Edit Box" in the toolbar
3. Use the markdown editor with live preview
4. Changes are saved automatically to IndexedDB

### Using AI

1. Click "AI Settings" in the toolbar to configure AI providers
2. Add provider configurations (name, type, API key, endpoint)
3. Select a box
4. Type your prompt in the AI panel at the bottom
5. Press Enter or click "Send"
6. Optionally click "Append to Box" to add AI response to the box content

### MCP Integration (Stub)

The MCP implementation is currently a stub that demonstrates the architecture. 
The following functions are available:

**Server (exposing data to AI):**
- `listCanvases()` - List all canvases
- `listBoxes(canvasId)` - List boxes in a canvas
- `getBox(boxId)` - Get a single box
- `getHierarchy()` - Get the full hierarchy tree
- `searchBoxes(query)` - Search box contents

**Client (connecting to AI MCP servers):**
- `connectToModel(serverName, command, args)` - Connect to an MCP server
- `disconnectFromModel(serverName)` - Disconnect
- `callTool(serverName, toolName, parameters)` - Call a tool
- `readResource(serverName, uri)` - Read a resource

To implement full MCP support:

```bash
# Install the MCP SDK
npm install @modelcontextprotocol/sdk
```

Then update the MCP files in `lib/mcp/` to use the actual SDK.

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Next.js configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI API Keys (optional - can also be configured via UI)
NEXT_PUBLIC_CLAUDE_API_KEY=sk-...
NEXT_PUBLIC_GEMINI_API_KEY=AIza...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS
- **Canvas**: Fabric.js 4.6
- **State Management**: Zustand
- **Database**: IndexedDB (browser storage)
- **Markdown**: react-markdown + remark-gfm
- **AI**: MCP-compatible architecture

## Current Status

✅ **Working Features:**
- Infinite canvas with zoom/pan
- Create/edit boxes with markdown
- Nested canvas navigation
- Hierarchy menu
- AI provider configuration
- AI chat panel with mock responses
- Export to markdown format
- Browser persistence via IndexedDB
- Responsive UI

🚧 **To Do / Next Steps:**
1. **Complete MCP Integration**: Install `@modelcontextprotocol/sdk` and implement full MCP server/client
2. **AI API Integration**: Connect to actual AI APIs (Claude, Gemini, OpenAI) in `app/api/ai/generate/route.ts`
3. **File Export**: Implement actual file download for export
4. **Authentication**: Add user accounts and session management
5. **Cloud Sync**: Add backend API for cloud storage
6. **Collaboration**: Real-time multi-user editing

## License

MIT
