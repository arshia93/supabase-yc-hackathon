export default function Page({ params }: { params: { url: string } }) {
  return <div>{params.url}</div>
}