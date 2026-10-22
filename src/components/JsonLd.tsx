// Structured data for search engines (schema.org JSON-LD), rendered by the server. A data
// block, not a script that runs: the browser does not execute `application/ld+json`.

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // `<` escaped, so a text in the data can never close the script element.
      // oxlint-disable-next-line react/no-danger -- JSON from our own content files
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replaceAll('<', '\\u003c') }}
    />
  )
}
