import ChatInbox from './ChatInbox'

export const metadata = { title: 'Live Chat — Admin Satra Garage+' }

export default function AdminChatPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-black text-foreground">Live Chat</h1>
        <p className="text-muted-foreground mt-2 font-medium">
          Asisten AI menjawab pertanyaan umum. Percakapan yang butuh admin ditandai, dan Anda bisa membalas atau mengambil alih kapan saja.
        </p>
      </div>
      <ChatInbox />
    </div>
  )
}
