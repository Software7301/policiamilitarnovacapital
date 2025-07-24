class Denuncia:
    def __init__(self, id, protocolo, nome, rg, tipo, descricao, youtube, status, finalizada_em):
        self.id = id
        self.protocolo = protocolo
        self.nome = nome
        self.rg = rg
        self.tipo = tipo
        self.descricao = descricao
        self.youtube = youtube
        self.status = status
        self.finalizada_em = finalizada_em

    @staticmethod
    def from_row(row):
        return Denuncia(
            id=row.get('id'),
            protocolo=row.get('protocolo'),
            nome=row.get('nome'),
            rg=row.get('rg'),
            tipo=row.get('tipo'),
            descricao=row.get('descricao'),
            youtube=row.get('youtube'),
            status=row.get('status'),
            finalizada_em=row.get('finalizada_em')
        )
