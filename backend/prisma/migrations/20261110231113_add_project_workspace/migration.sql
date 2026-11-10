-- CreateTable
CREATE TABLE "project_workspaces" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_messages" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_workspaces_team_id_key" ON "project_workspaces"("team_id");

-- CreateIndex
CREATE INDEX "workspace_messages_workspace_id_created_at_idx" ON "workspace_messages"("workspace_id", "created_at");

-- CreateIndex
CREATE INDEX "workspace_messages_sender_id_idx" ON "workspace_messages"("sender_id");

-- AddForeignKey
ALTER TABLE "project_workspaces" ADD CONSTRAINT "project_workspaces_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_messages" ADD CONSTRAINT "workspace_messages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "project_workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_messages" ADD CONSTRAINT "workspace_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
