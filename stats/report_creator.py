import sys

from report_generator_user import create_report_for_user
from report_generator_batch import create_report_for_batch

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
        sys.exit(1)
    else:
        # Agrega la veerificacion para que sys.argv[2] sea un entero o "all" 
        if not (str(sys.argv[2]).isdigit() or str(sys.argv[2]) == "all"):
            print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
            sys.exit(1)

    try:
        # Obtener los valores de los argumentos
        batch_id = int(sys.argv[1])
        user_id = int(sys.argv[2]) if str(sys.argv[2]).isdigit() else str(sys.argv[2])

    except ValueError:
        print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
        sys.exit(1)
    
    else:
        
        if user_id == "all":
            create_report_for_batch(batch_id, "all")
        else:
            create_report_for_user(batch_id, user_id)
