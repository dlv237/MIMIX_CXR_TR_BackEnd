from sshtunnel import SSHTunnelForwarder
import psycopg2
import os
import sys
import textwrap
from dotenv import load_dotenv

load_dotenv()

dic_ssh = {
  "ssh_host" : 'maicolpue.ing.puc.cl',
  "ssh_username" : os.getenv('MAICOLPUE_USER'),
  "ssh_password" : os.getenv('MAICOLPUE_PASSWORD')
}

dic_db = {
    "db_host" : 'localhost',
    "db_port" : 5445,
    "db_name" : 'MIMIC_CXR_DB',
    "db_user" : os.getenv('DB_USERNAME'),
    "db_password" : os.getenv('DB_PASSWORD')
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
        
        
def create_directory(batch, user):
    # El path será  batch_report_files/batch_{batch}/user_{user}/
    if not os.path.exists("batch_report_files"):
        os.mkdir("batch_report_files")
    if not os.path.exists(os.path.join("batch_report_files", f"batch_{batch}")):
        os.mkdir(os.path.join("batch_report_files", f"batch_{batch}"))
    if not os.path.exists(os.path.join("batch_report_files", f"batch_{batch}", f"user_{user}")):
        os.mkdir(os.path.join("batch_report_files", f"batch_{batch}", f"user_{user}"))
    if not os.path.exists(os.path.join("batch_report_files", f"batch_{batch}", f"user_{user}", "images")):
        os.mkdir(os.path.join("batch_report_files", f"batch_{batch}", f"user_{user}", "images"))        
    return os.path.join("batch_report_files", f"batch_{batch}", f"user_{user}")
     
def wrap_text(text, width=100):
    return '\n'.join(textwrap.wrap(text, width))

def highlight_text(text, sentence_id, words_to_highlight):
    caracteres = [".", ",", ";", ":", " "]
    for word in words_to_highlight[sentence_id]:
        
        for caracter in caracteres:
            if word + caracter in text:
                text = text.replace(word + caracter, f"<span style='color:red;font-weight:bold;'>{word + caracter}</span>")
        
    return text

if __name__ == "__main__":
    print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
    sys.exit(1)
    
