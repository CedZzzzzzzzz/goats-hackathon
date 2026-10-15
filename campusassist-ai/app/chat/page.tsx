import { ChatWindow } from "@/components/ChatWindow"

export default function ChatPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ask the AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ask anything about enrollment — the AI answers from a curated knowledge base and always cites its source.
        </p>
      </div>
      <ChatWindow />
      <p className="text-xs text-gray-400 text-center">
        The AI only answers from approved enrollment content. It never guesses or takes action on enrollments.
      </p>
    </div>
  )
}
