from sshtunnel import SSHTunnelForwarder
import psycopg2

dic_ssh = {
    "ssh_host" : 'maicolpue.ing.puc.cl',
    "ssh_username" : 'dolobos',
    "ssh_password" : '27marzo2003D'
}

dic_db = {
    "db_host" : 'localhost',
    "db_port" : 5445,
    "db_name" : 'MIMIC_CXR_DB',
    "db_user" : 'dolobos',
    "db_password" : '1qazxsw2M'
}


def execute_query_via_ssh(query, dic_ssh= dic_ssh , dic_db=dic_db):
    try:
        # Crear túnel SSH
        with SSHTunnelForwarder(
            (dic_ssh["ssh_host"], 22),
            ssh_username=dic_ssh["ssh_username"],
            ssh_password=dic_ssh["ssh_password"],
            remote_bind_address=(dic_db["db_host"], dic_db["db_port"]),
            local_bind_address=('localhost', dic_db["db_port"])
        ) as tunnel:

            # Conectar a PostgreSQL a través del túnel
            conn = psycopg2.connect(
                host='localhost',
                port=tunnel.local_bind_port,  # Puerto local del túnel
                database=dic_db["db_name"],
                user=dic_db["db_user"],
                password=dic_db["db_password"]
            )
            cursor = conn.cursor()

            # Ejecutar la consulta proporcionada
            cursor.execute(query)
            results = cursor.fetchall()
            
            cursor.close()
            conn.close()
            return results

    except Exception as e:
        print(f"Error: {e}")