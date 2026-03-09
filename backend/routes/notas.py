@router.get("/notas")
def listar_notas():
    return call_protheus("/api/invoices")
