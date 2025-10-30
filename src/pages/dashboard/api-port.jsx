import React, { useState } from "react";

function Operation({ op }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="opblock rounded-md bg-white shadow-sm overflow-hidden">
      <div className="flex">
        {/* colored bar like swagger's left border */}
        <div
          className={`w-1 ${
            op.method === "GET"
              ? "bg-green-500"
              : op.method === "POST"
              ? "bg-blue-500"
              : "bg-yellow-500"
          }`}
        />
        <div className="flex-1">
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="w-full p-3 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <span
                className={`op-method text-white px-2 py-1 rounded text-xs ${
                  op.method === "GET"
                    ? "bg-green-500"
                    : op.method === "POST"
                    ? "bg-blue-500"
                    : "bg-yellow-500"
                }`}
              >
                {op.method}
              </span>
              <code className="op-path text-sm text-[#636059] font-mono">
                {op.path}
              </code>
            </div>

            <div className="flex items-center gap-3">
              <div className="op-summary text-sm text-gray-500">
                {op.summary}
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${
                  open ? "rotate-90" : "rotate-0"
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7 6l6 4-6 4V6z" />
              </svg>
            </div>
          </button>

          {open && (
            <div className="px-4 pb-4 pt-0 text-sm text-[#636059] bg-gray-50">
              <div className="text-gray-700 mb-3">{op.description}</div>
              <div className="mb-2 text-xs text-gray-500">Example request</div>
              <pre className="mt-0 bg-white border rounded p-3 text-xs overflow-auto">{`curl -X ${op.method} "https://api.example.com${op.path}" \n  -H "Content-Type: application/json"`}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function APIPort() {
  const operations = [
    {
      method: "GET",
      path: "/api/example/get-items",
      summary: "Retrieve items",
      description:
        "Returns a list of items. Each item contains id, name and status. Supports paging via query params.",
    },
    {
      method: "POST",
      path: "/api/example/create-item",
      summary: "Create a new item",
      description:
        "Creates a new item. Provide a JSON body with 'name' (string) and optional attributes. Returns the created item with id.",
    },
    {
      method: "PUT",
      path: "/api/example/update-item/{id}",
      summary: "Update an existing item",
      description:
        "Updates fields of an existing item identified by 'id'. Provide a JSON body with the fields to update. Returns updated item.",
    },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <img
          src="/assets/logos/API Port Icon.svg"
          alt="api"
          className="w-12 h-12"
          style={{ filter: "invert(0.6)" }}
        />
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-[#636059]">API Port</h1>
          <p className="text-sm text-[#636059]">API endpoints and methods</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Wrapper using provided grouping HTML structure simplified for React */}
        <div className="pb-5">
          <div className="container pb-2">
            <div id="swagger-container">
              <div className="swagger-ui">
                <div className="information-container wrapper">
                  <section className="block col-12">
                    <div className="text-[#636059]">
                      This page lists API endpoints grouped by HTTP method.
                    </div>
                  </section>
                </div>

                <div className="wrapper">
                  <section className="block col-12 block-desktop col-12-desktop">
                    <div className="space-y-4">
                      {operations.map((op) => (
                        <div key={op.method + op.path} className="mb-2">
                          <Operation op={op} />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
