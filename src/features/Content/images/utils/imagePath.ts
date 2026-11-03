// NOTA (nov/2026): as rotas de imagem recebem o nome do arquivo do TMDB sem a
// barra inicial ("/abc.jpg" → "abc.jpg"), como poster_path/file_path trazem.
export function toImageEndpoint(path: string): string {
    return path.replace(/^\/+/, '');
}
