export function openBlobInNewTab(blob: Blob, filename = "relatorio.pdf") {
    const url = window.URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if(!win) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url),60_000);
}