-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "ecole42Id" INTEGER NOT NULL,
    "name" TEXT,
    "games" INTEGER NOT NULL DEFAULT 0,
    "wines" INTEGER NOT NULL DEFAULT 0,
    "loses" INTEGER NOT NULL DEFAULT 0,
    "level" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avatar" TEXT NOT NULL DEFAULT 'msu.jpeg',
    "custom" BOOLEAN NOT NULL DEFAULT false,
    "friends" INTEGER[],
    "blackList" INTEGER[],
    "chatId" INTEGER[],
    "gameId" INTEGER[],
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mail" TEXT NOT NULL DEFAULT 'youdonthave@mail.de',
    "achievementsId" INTEGER[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "key" INTEGER NOT NULL,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN DEFAULT false,
    "authorId" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "chat" BOOLEAN NOT NULL DEFAULT true,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "name" TEXT,
    "requestPass" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,
    "participants" INTEGER[],
    "owner" INTEGER[],
    "admins" INTEGER[],
    "blackList" INTEGER[],
    "muteList" INTEGER[],

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "player1id" INTEGER,
    "player2id" INTEGER,
    "winner" INTEGER,
    "score1" INTEGER,
    "score2" INTEGER,
    "finished" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL DEFAULT 0,
    "userName" TEXT NOT NULL DEFAULT 'NoName',
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ChatId" INTEGER,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_ecole42Id_key" ON "User"("ecole42Id");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Achievements_key_key" ON "Achievements"("key");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ChatId_fkey" FOREIGN KEY ("ChatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
