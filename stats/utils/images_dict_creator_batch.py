import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import seaborn as sns
import nltk
from nltk.corpus import stopwords
import os
import json
import sys
import numpy as np
from html2image import Html2Image
from PIL import Image

from utils.utils import execute_query_via_ssh, create_directory, wrap_text, highlight_text



def create_images_dict(batchId, userId):
    stop_words = set(stopwords.words('spanish'))
    path = create_directory(batchId, userId)  
    
    dic_reporte = {
    "resumen":{"batchId":batchId},
    "consulta_1":{},
    "consulta_2":{},
    "consulta_3":{},
    "consulta_4":{},
    } 
    
    #Obtener datos del batch
    consulta = f"""
    select cor."userId", cor."errorType", count(*)

    from (select distinct "Corrections"."userId" , public."Corrections"."translatedSentenceId" , public."Corrections"."errorType"  from public."Corrections") cor

    join public."TranslatedSentences" ts on cor."translatedSentenceId" = ts."sentenceId"

    join (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId} ) rgr on rgr."reportId" = ts."reportId"

    group by cor."userId", cor."errorType";
    """
    
    respuesta = execute_query_via_ssh(consulta)
    
    #crea el df
    df = pd.DataFrame(respuesta, columns=['user_id', 'error_type', 'count'])

    # Extraer los datos
    users = df['user_id'].unique()
    error_types = df['error_type'].unique()
    
    dic_reporte["resumen"]["users_id"] = [str(id_user) for id_user in users]

    # Preparar los datos en formato adecuado para barras apiladas
    data = {error: df[df['error_type'] == error].set_index('user_id')['count'].reindex(users, fill_value=0).values for error in error_types}

    # Posiciones en el eje x
    x = np.arange(len(users))

    # Crear las barras apiladas
    fig, ax = plt.subplots(figsize=(10, 6))

    # Inicializar la base para las barras apiladas
    bottom = np.zeros(len(users))

    # Añadir cada segmento de las barras
    for error_type, values in data.items():
        ax.bar(x, values, label=error_type, bottom=bottom)
        bottom += values

    # Personalización del gráfico
    ax.set_title('Errores por usuario y tipo (Barras Apiladas)', fontsize=14)
    ax.set_xlabel('Id de usuario', fontsize=12)
    ax.set_ylabel('Cantidad de Errores', fontsize=12)
    ax.set_xticks(x)
    ax.set_xticklabels(users)
    ax.legend(title='Tipo de Error', fontsize=10, title_fontsize=12)

    # Configurar el eje Y para mostrar solo enteros y marcas de 1 en 1
    #ax.yaxis.set_major_locator(ticker.MultipleLocator(1))  # Incrementos de 1 en 1
    #ax.yaxis.set_major_formatter(ticker.ScalarFormatter(useOffset=False))

    plt.tight_layout()
    plt.savefig(os.path.join(path, "images", "error_tipo_batch.png"), bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    
    consulta = f"""
    select cor."userId", cor."errorType", cor."translatedSentenceId"

    from (select distinct "Corrections"."userId" , public."Corrections"."translatedSentenceId" , public."Corrections"."errorType"  from public."Corrections") cor

    join 
            public."TranslatedSentences" ts on cor."translatedSentenceId" = ts."sentenceId"

    join (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId} ) rgr on rgr."reportId" = ts."reportId"

    group by cor."userId", cor."errorType", cor."translatedSentenceId";
    """

    respuesta = execute_query_via_ssh(consulta)
    
    df = pd.DataFrame(respuesta, columns=['user_id', 'error_type', 'sentence_id'])

    # Obtener la lista única de usuarios
    users = df['user_id'].unique()

    # Crear una matriz de concordancia vacía
    n_users = len(users)
    concordance_matrix = np.zeros((n_users, n_users))

    # Calcular la concordancia entre cada par de usuarios
    for i, user_i in enumerate(users):
        for j, user_j in enumerate(users):
            if i <= j:  # Simetría de la matriz
                # Filtrar las correcciones de cada usuario
                errors_i = df[df['user_id'] == user_i][['sentence_id', 'error_type']].drop_duplicates()
                errors_j = df[df['user_id'] == user_j][['sentence_id', 'error_type']].drop_duplicates()

                # Convertir a conjuntos para intersección y unión
                set_i = set(map(tuple, errors_i.values))
                set_j = set(map(tuple, errors_j.values))

                # Calcular intersección y unión
                common_errors = len(set_i & set_j)
                total_errors = len(set_i | set_j)

                # Índice de concordancia
                concordance_matrix[i, j] = concordance_matrix[j, i] = common_errors / total_errors if total_errors > 0 else 0

    # Crear el DataFrame para la matriz de calor
    concordance_df = pd.DataFrame(concordance_matrix, index=users, columns=users)

    # Graficar la matriz de calor
    plt.figure(figsize=(8, 6))
    sns.heatmap(concordance_df, annot=True, fmt=".2f", cmap="coolwarm", xticklabels=users, yticklabels=users)
    plt.title("Matriz de Concordancia entre Usuarios")
    plt.xlabel("Usuario")
    plt.ylabel("Usuario")
    plt.tight_layout()
    plt.savefig(os.path.join(path,"images", "matriz_palabra.png") , bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    ################# Datos para el reporte #################
    
    
    user_groups = df.groupby('user_id').apply(lambda x: set(zip(x['sentence_id'], x['error_type'])))

    # 1) Errores en común entre todos los usuarios (intersección)
    errors_common = set.intersection(*user_groups)
    common_count = len(errors_common)

    # 2) Errores no en común entre todos los usuarios (unión - intersección)
    errors_union = set.union(*user_groups)
    non_common_count = len(errors_union - errors_common)

    # 3) Métrica de acuerdo global (consistencia general)
    consistency_global = common_count / len(errors_union) if len(errors_union) > 0 else 0

    dic_reporte["dato_1"] = common_count
    dic_reporte["dato_2"] = non_common_count
    dic_reporte["dato_3"] = round(consistency_global, 2)
    
    consulta = f"""

    select cor."userId", cor."errorType", cor. "wordSelected"

    from public."Corrections" cor

    join 
            public."TranslatedSentences" ts on cor."translatedSentenceId" = ts."sentenceId"

    join (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId} ) rgr on rgr."reportId" = ts."reportId"

    group by cor."userId", cor."errorType",  cor. "wordSelected";"""



    respuesta = [
        (word[0], word[1], word[2].lower()) 
        for word in execute_query_via_ssh(consulta) 
        if word[2] not in stop_words and not word[2].isdigit() and word[2].isalnum()
    ]
    
        # Convertir a DataFrame
    df = pd.DataFrame(respuesta, columns=['user_id', 'error_type', 'word'])

    highlight_words_stop_words = set(df["word"].to_list())
    
    highlight_words = highlight_words_stop_words - stop_words


    # Contar la frecuencia de palabras por tipo de error
    word_counts = df.groupby(['word', 'error_type']).size().unstack(fill_value=0)
    
    

    # Obtener las 15 palabras más repetidas
    top_words = word_counts.sum(axis=1).nlargest(15).index
    top_word_counts = word_counts.loc[top_words]

    # Graficar barras apiladas
    top_word_counts.plot(kind='bar', stacked=True, figsize=(12, 6), colormap='viridis')

    # Personalizar el gráfico
    plt.title('Top 15 Palabras Más Corregidas del batch', fontsize=16)
    plt.xlabel('Palabras', fontsize=12)
    plt.ylabel('Frecuencia', fontsize=12)
    plt.xticks(rotation=45, fontsize=10)
    plt.legend(title='Tipo de Error', fontsize=10)

    plt.savefig(os.path.join(path,"images", "barras_batch_palabra.png") , bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    consulta = f"""

    select cor."userId", cor."errorType", cor. "wordSelected", cor."translatedSentenceId"

    from public."Corrections" cor

    join 
            public."TranslatedSentences" ts on cor."translatedSentenceId" = ts."sentenceId"

    join (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId} ) rgr on rgr."reportId" = ts."reportId"

    group by cor."userId", cor."errorType",  cor. "wordSelected", cor."translatedSentenceId";"""



    respuesta = [
        (word[0], word[1], word[2].lower(), word[3]) 
        for word in execute_query_via_ssh(consulta) 
        if word[2] not in stop_words and not word[2].isdigit() and word[2].isalnum()
    ]
    
    # Convertir a DataFrame
    df = pd.DataFrame(respuesta, columns=['user_id', 'error_type', 'word', 'sentence_id'])

    # Crear una nueva columna con la combinación (palabra, oración)
    df['word_sentence'] = df.apply(lambda x: (x['word'], x['sentence_id']), axis=1)
    df= df[~df["word_sentence"].apply(lambda x: x[0] in stop_words)]



    # Contar la frecuencia de cada tipo de error para cada (palabra, oración)
    word_sentence_counts = df.groupby(['word_sentence', 'error_type']).size().unstack(fill_value=0)
    
    
   

    # Obtener las 15 combinaciones (palabra, oración) más repetidas
    top_word_sentences = word_sentence_counts.sum(axis=1).nlargest(15).index
    top_word_sentence_counts = word_sentence_counts.loc[top_word_sentences]
    
  


    ## Graficar barras apiladas
    #top_word_sentence_counts.plot(kind='bar', stacked=True, figsize=(12, 6), colormap='viridis')
#
    ## Personalizar el gráfico
    #plt.title('Top 15 Palabras por Oración y Tipo de Error', fontsize=16)
    #plt.xlabel('Palabra y Oración', fontsize=12)
    #plt.ylabel('Frecuencia', fontsize=12)
    #plt.xticks(rotation=45, fontsize=10)
    #plt.legend(title='Tipo de Error', fontsize=10)
    #plt.tight_layout()
    #
    #plt.savefig(os.path.join(path,"images", "barras_batch_palabra_oracion.png") , bbox_inches='tight', dpi=300, facecolor='white')
    #plt.clf()
    
   
    top_word_sentence_counts['frequency'] = top_word_sentence_counts[['functional', 'grammatical', 'terminological']].sum(axis=1)
    
    
    
    # Crear el heatmap con las frecuencias
    plt.figure(figsize=(10, 8))
    
    sns.heatmap(
    top_word_sentence_counts[['functional', 'grammatical', 'terminological', 'frequency']], 
    annot=True, cmap="YlGnBu", cbar=True, fmt="d",
    annot_kws={"color": "black", "fontsize": 10}  # Cambia el color y tamaño del texto
)
    plt.title("Grilla de frecuencias por tipo de error")
    plt.ylabel("Tuplas")
    plt.yticks(range(len(top_word_sentence_counts)), top_word_sentence_counts.index, rotation=0)  # Etiquetas de filas
    plt.xlabel("Tipos de error")
    plt.tight_layout()
    plt.savefig(os.path.join(path,"images", "barras_batch_palabra_oracion.png") , bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()

    

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    ##########################################################
    
    df = pd.DataFrame(respuesta, columns=['user_id', 'error_type', 'word', 'sentence_id'])
    top_sentences = df['sentence_id'].value_counts().head(15)
    top_sentence_ids = top_sentences.index.tolist()
    
    errors_per_sentence = df['sentence_id'].value_counts().to_dict()
    
    df_15_sentences = df[df["sentence_id"].isin(top_sentence_ids)][['sentence_id', 'word']]
    sentence_dict = df_15_sentences.groupby('sentence_id')['word'].apply(list).to_dict()
    
    
    
    
    
    
    
    

    users = df['user_id'].unique()

    # Crear una matriz de concordancia vacía
    n_users = len(users)
    concordance_matrix = np.zeros((n_users, n_users))

    # Calcular la concordancia entre cada par de usuarios
    for i, user_i in enumerate(users):
        for j, user_j in enumerate(users):
            if i <= j:  # Simetría de la matriz
                # Filtrar las correcciones de cada usuario
                errors_i = df[df['user_id'] == user_i][['sentence_id', 'error_type', 'word']].drop_duplicates()
                errors_j = df[df['user_id'] == user_j][['sentence_id', 'error_type', 'word']].drop_duplicates()

                # Convertir a conjuntos para intersección y unión
                set_i = set(map(tuple, errors_i.values))
                set_j = set(map(tuple, errors_j.values))

                # Calcular intersección y unión
                common_errors = len(set_i & set_j)
                total_errors = len(set_i | set_j)

                # Índice de concordancia
                concordance_matrix[i, j] = concordance_matrix[j, i] = common_errors / total_errors if total_errors > 0 else 0

    # Crear el DataFrame para la matriz de calor
    concordance_df = pd.DataFrame(concordance_matrix, index=users, columns=users)

    # Graficar la matriz de calor
    plt.figure(figsize=(8, 6))
    sns.heatmap(concordance_df, annot=True, fmt=".2f", cmap="coolwarm", xticklabels=users, yticklabels=users)
    plt.title("Matriz de Concordancia entre Usuarios")
    plt.xlabel("Usuario")
    plt.ylabel("Usuario")
    plt.tight_layout()
    
    plt.savefig(os.path.join(path,"images", "matriz_palabra_oracion.png") , bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    
    ######## tabla de oraciones ########
    
    consulta = f"""
    SELECT "sentenceId", "text", "reportId"
    FROM public."TranslatedSentences"
    WHERE "sentenceId" IN ({', '.join(map(str, top_sentence_ids))});
    """
    
    respuesta = [(i[0], i[1], errors_per_sentence[i[0]], i[2]) for i in execute_query_via_ssh(consulta)]
    # Crear DataFrame y resaltar IDs
    df_respuesta = pd.DataFrame(respuesta, columns=['id_oracion', 'oracion', 'num_errores', 'id_reporte'])
    highlight_ids = {item[1] for item in top_word_sentences}
    
    
    
    # Aplicar el resaltado de palabras
    df_respuesta['oracion'] = df_respuesta.apply(
        lambda row: highlight_text(row['oracion'], row["id_oracion"], sentence_dict), axis=1
        )
    
    
    
    def highlight_row(row):
        color = 'background-color: #d3f8d3;' if row['id_oracion'] in highlight_ids else 'background-color: #FFFFFF;'
        return [color] * len(row)
    
    # Estilizar la tabla con Pandas Styler
    styled_df = df_respuesta.style.apply(highlight_row, axis=1).set_table_styles([
    {'selector': 'th', 'props': [('background-color', '#add8e6'), ('color', 'black'), ('font-weight', 'bold')]},
    {'selector': 'td', 'props': [('padding', '5px'), ('text-align', 'left')]},
    {'selector': 'table', 'props': [('width', '1800'), ('margin', 'auto')]},  # Ancho total de la tabla
    {'selector': 'td:nth-child(3)', 'props': [
        ('width', '600px'),  # Ancho ajustado para la columna "oración"
        ('word-wrap', 'break-word'),
        ('word-break', 'break-word'),
        ('white-space', 'normal')  # Permitir saltos de línea en el texto
    ]}
], overwrite=False).to_html()

    # Guardar el HTML de la tabla
    html_file = os.path.join(path,"images", "tabla_resaltada.html")
    with open(html_file, "w") as f:
        f.write(styled_df)

    # Usar Html2Image para convertir el HTML en una imagen PNG
    hti = Html2Image(output_path=os.path.join(path,"images"))
    hti.screenshot(html_file=html_file, save_as="tabla_resaltada_full.png")

    # Recortar la tabla usando Pillow
    image = Image.open(os.path.join(path,"images", "tabla_resaltada_full.png"))
    cropped_image = image.crop(image.getbbox())  # Recortar para eliminar espacio en blanco
    cropped_image.save(os.path.join(path,"images", "tabla_oraciones.png"))
    
    
    


    
    ## La tabla se tiene que llamar tabla_oraciones.png
    
    
    ############# fin tabla de oraciones #############

    
    dic_reporte["path"] = path
    dic_reporte["image_paths"] = [ 
        os.path.join(path,"images", "error_tipo_batch.png"),
        os.path.join(path,"images", "matriz_palabra.png"),
        os.path.join(path,"images", "barras_batch_palabra.png"),
        os.path.join(path,"images", "barras_batch_palabra_oracion.png"),
        os.path.join(path,"images", "matriz_palabra_oracion.png"),
        os.path.join(path,"images", "tabla_oraciones.png")
    ]
    
    dic_reporte["pdf_path"] = os.path.join(path, "report.pdf")
    
    dir_list = os.listdir(os.path.join("batch_report_files", f"batch_{batchId}"))
    otro_user = ""
    
    if len(dir_list) > 1:
        for user in dir_list:
            if user != f"user_{userId}":
                otro_user = user
                otro_user_path = os.path.join("batch_report_files", f"batch_{batchId}", user)
                otro_user_dict = json.load(open(os.path.join(otro_user_path, "dic_reporte.json")))
                dic_reporte['resumen']['modelo'] = otro_user_dict['resumen']['modelo']
                dic_reporte['resumen']['total_oraciones'] = otro_user_dict['resumen']['total_oraciones']
                break
    else:
        #Obtener datos del batch
        consulta = f"""
        select distinct ts."model"

        from public."TranslatedReports" ts

        join (select * from public."ReportGroupReports" where  public."ReportGroupReports"."reportGroupId" = {batchId}) rgr on rgr."reportId" = ts."reportId"
        """
        respuesta = execute_query_via_ssh(consulta)
        dic_reporte["resumen"]["modelo"] = respuesta[0][0]
        
 
        
        consulta = f"""
        select 
            count(*) filter(where t_user."isSelectedCheck" = true ) as conteo_buenas,
            count(*) filter(where t_user."isSelectedTimes" = true ) as conteo_malas
            
        from 
            (select * from public."UserTranslatedSentences" where public."UserTranslatedSentences"."userId" = {users[0]}) t_user 

        join 
            public."TranslatedSentences" ts on t_user."translatedsentenceId" = ts."sentenceId"

        join
            (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId} ) rgr on rgr."reportId" = ts."reportId"

        """
        respuesta = execute_query_via_ssh(consulta)
        

        dic_reporte["resumen"]["total_oraciones"] = respuesta[0][0] + respuesta[0][1]
        
       
        
    
        
    
    
    
    with open(os.path.join(path, "dic_reporte.json") , 'w') as archivo_json:
        json.dump(dic_reporte, archivo_json, indent=4)
        
    
    
    return dic_reporte   


if __name__ == "__main__":
    print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
    sys.exit(1)