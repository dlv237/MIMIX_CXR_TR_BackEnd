import sys

from images_dict_creator_batch import create_images_dict


def create_report_for_batch(batch_id, user_id):
    print(f"Creando reporte para el batch {batch_id} y el usuario {user_id}")   
    dict_rep =  create_images_dict(batch_id, user_id)   

if __name__ == "__main__":
    print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
    sys.exit(1)