import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import nltk
from nltk.corpus import stopwords
import os
import json
import sys

from utils.utils import execute_query_via_ssh, create_directory

nltk.download('stopwords')




def create_images_dict(batchId, userId):
    stop_words = set(stopwords.words('spanish'))
    
    # Creamos el directorio para guardar los archivos
    path = create_directory(batchId, userId)
    

    
    dic_reporte = {
    "resumen":{"batchId":batchId, "userId":userId},
    "consulta_1":{},
    "consulta_2":{},
    "consulta_3":{},
    "consulta_4":{},
    }
    
    #Obtener datos del batch
    consulta = f"""
    select distinct ts."model"

    from public."TranslatedReports" ts

    join (select * from public."ReportGroupReports" where  public."ReportGroupReports"."reportGroupId" = {batchId}) rgr on rgr."reportId" = ts."reportId"
    """
    respuesta = execute_query_via_ssh(consulta)
    dic_reporte["resumen"]["modelo"] = respuesta[0][0]
    
    #Consulta 1
    consulta = f"""
    select 
        count(*) filter(where t_user."isSelectedCheck" = true ) as conteo_buenas,
        count(*) filter(where t_user."isSelectedTimes" = true ) as conteo_malas
        
    from 
        (select * from public."UserTranslatedSentences" where public."UserTranslatedSentences"."userId" = {userId}) t_user 

    join 
        public."TranslatedSentences" ts on t_user."translatedsentenceId" = ts."sentenceId"

    join
        (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId} ) rgr on rgr."reportId" = ts."reportId"

    """
    respuesta = execute_query_via_ssh(consulta)

    dic_reporte["consulta_1"]["correctas"] = respuesta[0][0]
    dic_reporte["consulta_1"]["errores"] = respuesta[0][1]
    dic_reporte["resumen"]["total_oraciones"] = respuesta[0][0] + respuesta[0][1]

    #graficar con seaborn barplot sin usar dataframe
    ax = sns.barplot(x=['Correctas', 'Errores'], y=list(respuesta[0]), width=0.5, palette="viridis")
    plt.title('Cantidad de oraciones correctas vs con errores')
    plt.ylabel('Cantidad')
    plt.gca().set_facecolor('white')


    for i in range(len(list(respuesta[0]))):
        plt.text(i, respuesta[0][i] , str(respuesta[0][i]), ha='center')


    plt.savefig(os.path.join(path,"images", "batch_error.png") , bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    
    #Consulta 2
    
    consulta = f"""
    select 
        t_user."errorType" , count(*)
        
        
    from 
        (select DISTINCT public."Corrections"."errorType", public."Corrections"."translatedSentenceId" from public."Corrections" where public."Corrections"."userId" = {userId}) t_user 


        
    join 
        public."TranslatedSentences" ts on t_user."translatedSentenceId" = ts."sentenceId"

    join
        (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId} ) rgr on rgr."reportId" = ts."reportId"

    group by
        t_user."errorType"
    """
    respuesta = execute_query_via_ssh(consulta)


    # Extraer datos
    errores = [item[0] for item in respuesta]
    cantidades = [item[1] for item in respuesta]
    
    sort_cantidades = []
    sort_errores = []   
    for tipo in ["functional", "grammatical", "terminological"]:
        if not tipo in errores:
            sort_cantidades.append(0)
            sort_errores.append(tipo)
        else:
            index = errores.index(tipo)
            sort_cantidades.append(cantidades[index])
            sort_errores.append(tipo)
            
    errores = sort_errores
    cantidades = sort_cantidades

    dic_reporte["consulta_2"]["e_funcional"] = cantidades[0]
    dic_reporte["consulta_2"]["e_gramatical"] = cantidades[1]
    dic_reporte["consulta_2"]["e_terminologico"] = cantidades[2]


    ax = sns.barplot(x=errores, y=cantidades, width=0.5, palette="viridis")
    plt.title('Cantidad de errores por tipo')
    plt.ylabel('Cantidad')
    plt.xlabel('Tipo de error')

    for i, cantidad in enumerate(cantidades):
        plt.text(i, cantidad + 0.08, str(cantidad), ha='center')  # `cantidad + 1` para colocar el texto un poco encima
    plt.gca().set_facecolor('white')

    plt.savefig(os.path.join(path,"images",  "batch_tipo_error.png") , bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    
    #Consulta 3
    consulta = f"""
    select 
    rgr."reportId",
    count(*) filter (where t_user."isSelectedCheck" = true) as correctas,
    count(*) filter (where t_user."isSelectedTimes" = true) as errores
        
        
        
    from 
        (select * from public."UserTranslatedSentences" where public."UserTranslatedSentences"."userId" = {userId}) t_user 

        
        
    join 
        public."TranslatedSentences" ts on t_user."translatedsentenceId" = ts."sentenceId"

    join
        (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId}) rgr on rgr."reportId" = ts."reportId"

    group by
        rgr."reportId"
    """


    respuesta = execute_query_via_ssh(consulta)
    df = pd.DataFrame(respuesta, columns=['Reporte', 'Correctas', 'Errores']).sort_values(by='Reporte')

    dic_reporte["consulta_3"]["or_correctas"] = df["Correctas"].to_list()
    dic_reporte["consulta_3"]["or_errores"] = df["Errores"].to_list()
    dic_reporte["consulta_3"]["total_correctas"] = sum(df["Correctas"].to_list())
    dic_reporte["consulta_3"]["total_errores"] = sum(df["Errores"].to_list())
    dic_reporte["resumen"]["total_reportes"] = len(df)	
    # Crear una figura de matplotlib
    fig, ax = plt.subplots(figsize=(6, 4))

    # Ocultar el eje
    ax.axis('tight')
    ax.axis('off')

    # Dibujar la tabla
    table = ax.table(cellText=df.values, colLabels=df.columns, cellLoc='center', loc='center')

    # Ajustar diseño
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.auto_set_column_width(col=list(range(len(df.columns))))

    # Guardar la tabla como imagen
    plt.gca().set_facecolor('white')

    plt.savefig(os.path.join(path,"images",  "tabla_resultados.png"), bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    
    #Consulta 4
    consulta = f"""
    SELECT 
        rgr."reportId",
        COUNT(*) FILTER (WHERE c_user."errorType" = 'functional') AS functional,
        COUNT(*) FILTER (WHERE c_user."errorType" = 'terminological') AS terminological,
        COUNT(*) FILTER (WHERE c_user."errorType" = 'grammatical') AS grammatical,
        
        COUNT(*) FILTER (WHERE c_user."errorType" = 'functional') +
        COUNT(*) FILTER (WHERE c_user."errorType" = 'terminological') +
        COUNT(*) FILTER (WHERE c_user."errorType" = 'grammatical') AS total
    FROM 
        (SELECT DISTINCT 
            public."Corrections"."userId", 
            public."Corrections"."translatedSentenceId", 
            public."Corrections"."errorType"
        FROM 
            public."Corrections" 
        WHERE 
            public."Corrections"."userId" = {userId}) c_user
    RIGHT JOIN 
        public."TranslatedSentences" ts 
        ON c_user."translatedSentenceId" = ts."sentenceId"
    JOIN 
        (SELECT * 
        FROM public."ReportGroupReports" 
        WHERE public."ReportGroupReports"."reportGroupId" = {batchId}) rgr 
        ON rgr."reportId" = ts."reportId"
    GROUP BY 
        rgr."reportId";

    """


    respuesta = execute_query_via_ssh(consulta)
    df = pd.DataFrame(respuesta, columns=['Reporte', 'Funcional', 'Terminológico', "Gramatical", "Total"]).sort_values(by='Reporte')

    dic_reporte["consulta_4"]["or_funcional"] = df["Funcional"].to_list()
    dic_reporte["consulta_4"]["or_terminologico"] = df["Terminológico"].to_list()
    dic_reporte["consulta_4"]["or_gramatical"] = df["Gramatical"].to_list()
    dic_reporte["consulta_4"]["total_funcional"] = sum(df["Funcional"].to_list())
    dic_reporte["consulta_4"]["total_terminologico"] = sum(df["Terminológico"].to_list())
    dic_reporte["consulta_4"]["total_gramatical"] = sum(df["Gramatical"].to_list())



    # Crear una figura de matplotlib
    fig, ax = plt.subplots(figsize=(6, 4))

    # Ocultar el eje
    ax.axis('tight')
    ax.axis('off')

    # Dibujar la tabla
    table = ax.table(cellText=df.values, colLabels=df.columns, cellLoc='center', loc='center')

    # Ajustar diseño
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.auto_set_column_width(col=list(range(len(df.columns))))

    # Guardar la tabla como imagen
    plt.gca().set_facecolor('white')

    plt.savefig(os.path.join(path, "images", "tabla_resultados_2.png"), bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()

    # Consulta 5
    
    consulta = f"""
    select 
        t_user."wordSelected"
        
    from 
        (select * from public."Corrections"  where public."Corrections"."userId" = {userId}) t_user 

    join 
        public."TranslatedSentences" ts on t_user."translatedSentenceId" = ts."sentenceId"

    join
        (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId}) rgr on rgr."reportId" = ts."reportId"
    """

    

    respuesta = [i[0].lower() for i in execute_query_via_ssh(consulta) if i[0] not in stop_words and not i[0].isdigit() and i[0].isalnum()]
    contador_user = pd.Series(respuesta).value_counts()


    #Consulta 6
    consulta = f"""
    select 
        ts."text"
        
    from 
        (select * from public."TranslatedSentences" ) ts


    join
        (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = {batchId}) rgr on rgr."reportId" = ts."reportId"
    """

    

    respuesta = execute_query_via_ssh(consulta)
    
    lista_palabras = []
    for oracion in respuesta:
        palabras = [palabra.lower() for palabra in oracion[0].split() if palabra.lower() not in stop_words and not palabra.isdigit() and palabra.isalnum()]
        lista_palabras.extend(palabras)
        
    contador_batch = pd.Series(lista_palabras).value_counts()
    
    
    
    # GRAFICO DE CONSULTA 5 
    
    colores = ['red' if palabra in list(contador_batch.index[:15]) else 'skyblue' for palabra in contador_user.index[:15]]
    
    plt.figure(figsize=(12, 6))
    sns.barplot(x=contador_user.index[:15], y=contador_user.values[:15], palette=colores)
    plt.title('Palabras más comunes en correcciones')
    plt.ylabel('Frecuencia')
    plt.xlabel('Palabra')
    plt.xticks(rotation=45)

    for i, valor in enumerate(contador_user.values[:15]):
        plt.text(i, valor, str(valor), ha='center', va='bottom')  # Posiciona el texto sobre la barra
        
    plt.gca().set_facecolor('white')
    plt.savefig(os.path.join(path, "images", "user_15_palabras.png"), bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    
    
    # GRAFICO CONSULTA 6
  
    colores = ['red' if palabra in list(contador_user.index[:15]) else 'skyblue' for palabra in contador_batch.index[:15]]

    plt.figure(figsize=(12, 6))
    sns.barplot(x=contador_batch.index[:15], y=contador_batch.values[:15], palette=colores)
    plt.title(f'Palabras más comunes en correcciones en batch {batchId}')	
    plt.ylabel('Frecuencia')
    plt.xlabel('Palabra')
    plt.xticks(rotation=45)

    for i, valor in enumerate(contador_batch.values[:15]):
        plt.text(i, valor + 0.5, str(valor), ha='center', va='bottom')  # Posiciona el texto sobre la barra
        
    plt.gca().set_facecolor('white')
    plt.savefig(os.path.join(path,"images",  "batch_15_palabras.png") , bbox_inches='tight', dpi=300, facecolor='white')
    plt.clf()
    
    dic_reporte["path"] = path
    
    dic_reporte["images_paths"] = [os.path.join(path, "images", "batch_error.png"),
                                   os.path.join(path, "images", "batch_tipo_error.png"),
                                   os.path.join(path, "images", "tabla_resultados.png"),
                                   os.path.join(path, "images", "tabla_resultados_2.png"),
                                   os.path.join(path, "images", "user_15_palabras.png"),
                                   os.path.join(path, "images", "batch_15_palabras.png")
                                   ]

    dic_reporte["pdf_path"] = os.path.join(path, "report.pdf")
        
    
    #Cálculo de estadísicas
    dic_reporte["consulta_1"]["e1"] = round(dic_reporte['consulta_1']['errores'] / dic_reporte['resumen']['total_oraciones'], 2)
    dic_reporte["consulta_1"]["e2"] = round(dic_reporte['consulta_1']['correctas'] / dic_reporte['resumen']['total_oraciones'], 2)
    
    dic_reporte["consulta_2"]["total_errores"] = dic_reporte["consulta_2"]["e_funcional"] + dic_reporte["consulta_2"]["e_gramatical"] + dic_reporte["consulta_2"]["e_terminologico"]
    dic_reporte["consulta_2"]["e1"] = round(dic_reporte['consulta_2']['e_funcional'] / (dic_reporte["consulta_2"]["total_errores"]) * 100, 2)
    dic_reporte["consulta_2"]["e2"] = round(dic_reporte['consulta_2']['e_gramatical'] / (dic_reporte["consulta_2"]["total_errores"]) * 100, 2)
    dic_reporte["consulta_2"]["e3"] = round(dic_reporte['consulta_2']['e_terminologico'] / (dic_reporte["consulta_2"]["total_errores"]) * 100, 2)

    dic_reporte["consulta_4"]["total_errores"] = dic_reporte["consulta_4"]["total_funcional"] + dic_reporte["consulta_4"]["total_gramatical"] + dic_reporte["consulta_4"]["total_terminologico"]
    dic_reporte["consulta_4"]["e1"] = round(dic_reporte['consulta_4']['total_funcional'] / (dic_reporte["consulta_4"]["total_errores"]) * 100, 2)
    dic_reporte["consulta_4"]["e2"] = round(dic_reporte['consulta_4']['total_terminologico'] / (dic_reporte["consulta_4"]["total_errores"]) * 100, 2)
    dic_reporte["consulta_4"]["e3"] = round(dic_reporte['consulta_4']['total_gramatical'] / (dic_reporte["consulta_4"]["total_errores"]) * 100, 2)
    
    with open(os.path.join(path, "dic_reporte.json") , 'w') as archivo_json:
        json.dump(dic_reporte, archivo_json, indent=4)
    
    return dic_reporte      

if __name__ == "__main__":
    print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
    sys.exit(1)