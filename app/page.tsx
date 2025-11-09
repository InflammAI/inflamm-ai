import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect root to the Inflamm AI app
  redirect('/inflamm-ai')
}
