const folders = [
  { name: "src", files: ["app.tsx", "layout.tsx", "theme.css"] },
  { name: "components", files: ["editor-header.tsx", "editor-pane.tsx"] },
  { name: "services", files: ["workspace.service.ts"] },
];

export function EditorSidebar() {
  return (
    <aside className="rounded-3xl border border-(--border) bg-(--surface-raised) p-4 shadow-(--shadow-sm)">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-(--text-secondary)">
          Explorer
        </h2>
        <span className="rounded-full border border-(--border) bg-(--surface) px-2 py-1 text-xs text-(--text-tertiary)">
          3 folders
        </span>
      </div>

      <div className="space-y-4">
        {folders.map((folder) => (
          <div
            key={folder.name}
            className="rounded-2xl border border-(--border) bg-(--surface) p-3"
          >
            <p className="mb-2 text-sm font-medium text-(--text-primary)">{folder.name}</p>
            <ul className="space-y-1">
              {folder.files.map((file) => (
                <li key={file} className="text-xs text-(--text-secondary)">
                  {file}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
