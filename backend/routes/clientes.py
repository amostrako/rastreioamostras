@router.get("/clientes")
def listar_clientes():
    return call_protheus("/api/customers")
