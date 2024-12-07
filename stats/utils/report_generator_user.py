from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import sys
import os
import time
import json
import base64

from utils.images_dict_creator_user  import create_images_dict

def imagen_a_base64(ruta_imagen):
    with open(ruta_imagen, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')

def convert_sets_to_lists(data):
    if isinstance(data, dict):
        return {k: convert_sets_to_lists(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [convert_sets_to_lists(i) for i in data]
    elif isinstance(data, set):
        return list(data)
    else:
        return data

def guardar_json(data, ruta_json):
    data = convert_sets_to_lists(data)
    with open(ruta_json, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def create_report_data(dic_rep, batch_id, user_id):
    """Compila todos los datos en un diccionario estructurado."""
    data = {
        "titulo": f"Reporte de Batch {batch_id}",
        "resumen": {
            f"- Id de Batch (ReportGroupReport): {batch_id}",
            f"- Id de usuario: {user_id}",
            f"- Modelo utilizado: {dic_rep['resumen']['modelo']}",
            f"- Cantidad de reportes incluidos: {dic_rep['resumen']['total_reportes']}",
            f"- Cantidad de oraciones incluidas: {dic_rep['resumen']['total_oraciones']}",
        },
        "secciones": []
    }

    # Sección 1
    data["secciones"].append({
        "titulo": " Porcentaje de oraciones de batch con al menos un error",
        "descripcion": (
            "Descripción: Se obtiene la cantidad de oraciones que presentan al menos un error en el batch analizado."
        ),
        "grafico": {
            "tipo": "imagen",
            "contenido_base64": imagen_a_base64(dic_rep['images_paths'][0])
        },
        "texto_grafico": "Gráfico 1: Cantidad de oraciones de batch con al menos un error",
        "resultados": {
            "Total_de_oraciones": f"{dic_rep['resumen']['total_oraciones']}",
            "Oraciones_correctas": f"{dic_rep['consulta_1']['correctas']}",
            "Oraciones_con_errores":  f"{dic_rep['consulta_1']['errores']}",
            "Porcentaje_de_oraciones_con_al_menos_un_error":  f"{dic_rep['consulta_1']['e1']}%",
            "Porcentaje_de_oraciones_correctas": f"{dic_rep['consulta_1']['e2'] }%"
        }
    })

    # Sección 2
    data["secciones"].append({
        "titulo": "Cantidad de errores por tipo",
        "descripcion": (
            "Para el batch solicitado, se obtiene la cantidad de oraciones que presentan cada tipo de error. Antiguamente incluía tantos errores como palabras asociadas a la corrección"
        ),
        "grafico": {
            "tipo": "imagen",
            "contenido_base64": imagen_a_base64(dic_rep['images_paths'][1])
        },
        "texto_grafico": "Gráfico 2: Cantidad de oraciones que presentan cada tipo de error",
        "resultados": {
            "Errores_de_tipo_funcional": f"{dic_rep['consulta_2']['e_funcional']} ; {dic_rep['consulta_2']['e1']}%",
            "Errores_de_tipo_gramatical": f"{dic_rep['consulta_2']['e_gramatical']} ; {dic_rep['consulta_2']['e2']}%",
            "Errores_de_tipo_terminológico": f"{dic_rep['consulta_2']['e_terminologico']} ; {dic_rep['consulta_2']['e3']}%",
            "Total_de_errores": f"{dic_rep['consulta_2']['total_errores']}" 
        }
    })

    # Sección 3
    data["secciones"].append({
        "titulo": "Cantidad de errores únicos por reporte",
        "descripcion": (
            "Para el batch solicitado, se obtiene la cantidad de errores ÚNICOS por cada reporte incluido, para esto se utilizó la tabla UserTranslatedSentences. Se entiende por único a que independiente de que una oración posea errores en dos categorías diferentes, se contará como un solo error."
        ),
        "grafico": {
            "tipo": "imagen",
            "contenido_base64": imagen_a_base64(dic_rep['images_paths'][2])
        },
        "texto_grafico": "Tabla 1: Cantidad de errores únicos por reporte",
        "resultados": {
            "Total_de_oraciones": f"{dic_rep['resumen']['total_oraciones']}",
            "Oraciones_correctas": f"{dic_rep['consulta_3']['total_correctas']}",
            "Oraciones_con_errores": f"{dic_rep['consulta_3']['total_errores']}",
        }
    })

    # Sección 4
    data["secciones"].append({
        "titulo": "Cantidad de errores por reporte",
        "descripcion": (
            "Para el batch solicitado, se obtiene la cantidad de errores por cada reporte incluido. Para esto se utilizó la tabla Corrections. En este caso, una oración puede poseer errores en más de una categoría diferente."
        ),
        "grafico": {
            "tipo": "imagen",
            "contenido_base64": imagen_a_base64(dic_rep['images_paths'][3])
        },
        "texto_grafico": "Tabla 2: Cantidad de errores por reporte",
        "resultados": {
            "Total_de_errores_Funcionales": f"{dic_rep['consulta_4']['total_funcional']}  ;  {dic_rep['consulta_4']['e1']}%", #e1
            "Total_de_errores_Terminológicos": f"{dic_rep['consulta_4']['total_terminologico']}  ;  {dic_rep['consulta_4']['e2']}%", #e2
            "Total_de_errores_Gramaticales": f"{dic_rep['consulta_4']['total_gramatical']}  ;  {dic_rep['consulta_4']['e3']}%", #e3
            "Total_de_errores": f"{dic_rep['consulta_4']['total_errores']}"
        }
    })

    # Sección 5
    data["secciones"].append({
        "titulo": "Top 15 palabras más corregidas por usuario",
        "descripcion": (
            "Para el batch solicitado, se obtiene las 15 palabras más corregidas por el usuario. Se ignoraron stopwords y palabras compuestas úniamente de números. Se destacan en rojo aquellas palabras incluidas en el top 15 de palabras más repetidas del batch."
        ),
        "grafico": {
            "tipo": "imagen",
            "contenido_base64": imagen_a_base64(dic_rep['images_paths'][4])
        },
        "texto_grafico": "Gráfico 3: Top 15 palabras más corregidas por usuario"
    })

    # Sección 6
    data["secciones"].append({
        "titulo": "Top 15 palabras más repetidas del batch",
        "descripcion": (
            "Para el batch solicitado, se obtiene las 15 palabras más repetidas del batch. Se ignoraron stopwords y palabras compuestas úniamente de números. Se destacan en rojo aquellas palabras incluidas en el top 15 de palabras más corregidas por el usuario."
        ),
        "grafico": {
            "tipo": "imagen",
            "contenido_base64": imagen_a_base64(dic_rep['images_paths'][5])
        },
        "texto_grafico": "Gráfico 4: Top 15 palabras más repetidas del batch"
    })

    return data

def create_report_for_user(batch_id, user_id):
    tiempo_inicial = time.time()

    dic_rep = create_images_dict(batch_id, user_id)

    
    # Crear el PDF
    pdf = SimpleDocTemplate(dic_rep['pdf_path'], pagesize=letter)

    report_data = create_report_data(dic_rep, batch_id, user_id)

    ruta_pdf = dic_rep['pdf_path']
    ruta_json = ruta_pdf.replace(".pdf", ".json")
    guardar_json(report_data, ruta_json)

    # Estilos para el texto
    styles = getSampleStyleSheet()
    style_title = styles['Title']
    style_heading = styles['Heading2']
    style_body = styles['BodyText']

    # Estilo para texto centrado
    style_centered = ParagraphStyle(
        name="Centered",
        parent=styles['BodyText'],
        alignment=1  # 1 es para centrar el texto
    )

    # Elementos del PDF
    elements = []

    # Título del reporte
    titulo = f"Reporte de Batch {batch_id}"
    elements.append(Paragraph(titulo, style_title))
    elements.append(Spacer(1, 20))  # Espaciador entre el título y el contenido

    # Resumen de información del reporte
    resumen = [
        f"- Id de Batch (ReportGroupReport): {batch_id}",
        f"- Id de usuario: {user_id}",
        f"- Modelo utilizado: {dic_rep['resumen']['modelo']}",
        f"- Cantidad de reportes incluidos: {dic_rep['resumen']['total_reportes']}",
        f"- Cantidad de oraciones incluidas: {dic_rep['resumen']['total_oraciones']}",
    ]
    for linea in resumen:
        elements.append(Paragraph(linea, style_body))
    elements.append(Spacer(1, 30))

    # Primera consulta: Porcentaje de oraciones de batch con al menos un error
    elements.append(Paragraph("1) Porcentaje de oraciones de batch con al menos un error", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico
    elements.append(Paragraph(
        "Descripción: Se obtiene la cantidad de oraciones que presentan al menos un error en el batch analizado.",
        style_body
    ))
    elements.append(Spacer(1, 10))

    # Insertar gráfico
    ruta_grafico = dic_rep['images_paths'][0]

    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 1: Cantidad de oraciones de batch con al menos un error",
        style_centered
    ))
    elements.append(Spacer(1, 40))

    # Resultado de la consulta
    texto_consulta = [
        f"- Total de oraciones: {dic_rep['resumen']['total_oraciones']}",
        f"- Oraciones correctas: {dic_rep['consulta_1']['correctas']}",
        f"- Oraciones con errores: {dic_rep['consulta_1']['errores']}",
        f"- Porcentaje de oraciones con al menos un error: {dic_rep['consulta_1']['e1']}%", 
        f"- Porcentaje de oraciones corectas: {dic_rep['consulta_1']['e2'] }%",
    ]


    elements.append(Paragraph("Resultados:", style_body))
    elements.append(Spacer(1, 10))
    for linea in texto_consulta:
        elements.append(Paragraph(linea, style_body))
        


    elements.append(PageBreak())

    # Segunda consulta: Cantidad de errores por tipo
    elements.append(Paragraph("2) Cantidad de errores por tipo", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico
    elements.append(Paragraph(
        "Descripción: Para el batch solicitado, se obtiene la cantidad de oraciones que presentan cada tipo de error. Antiguamente incluía tantos errores como palabras asociadas a la corrección",
        style_body
    ))
    elements.append(Spacer(1, 10))

    # Insertar gráfico

    ruta_grafico = dic_rep['images_paths'][1]

    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 2: Cantidad de oraciones que presentan cada tipo de error",
        style_centered
    ))

    elements.append(Spacer(1, 20))

    # Resultado de la consulta
    texto_consulta = [
        f"- Errores de tipo Funcional: {dic_rep['consulta_2']['e_funcional']} ; {dic_rep['consulta_2']['e1']}%", #e1
            
        f"- Errores de tipo Gramatical: {dic_rep['consulta_2']['e_gramatical']} ; {dic_rep['consulta_2']['e2']}%", #e2
            
        f"- Errores de tipo Terminológico: {dic_rep['consulta_2']['e_terminologico']} ; {dic_rep['consulta_2']['e3']}%", #e3
            
        f"- Total de errores: {dic_rep['consulta_2']['total_errores']}" 
    ]

    elements.append(Paragraph("Resultados:", style_body))
    elements.append(Spacer(1, 10))
    for linea in texto_consulta:
        elements.append(Paragraph(linea, style_body))

    elements.append(PageBreak())

    # tercer consulta: Cantidad de errores por reporte

    elements.append(Paragraph("3) Cantidad de errores únicos por reporte", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico
    elements.append(Paragraph(
        "Descripción: Para el batch solicitado, se obtiene la cantidad de errores ÚNICOS por cada reporte incluido, para esto se utilizó la tabla UserTranslatedSentences. Se entiende por único a que independiente de que una oración posea errores en dos categorías diferentes, se contará como un solo error.",
        style_body
    ))
    elements.append(Spacer(1, 10))

    # Insertar gráfico
    ruta_grafico = dic_rep['images_paths'][2]

    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Tabla 1: Cantidad de errores únicos por reporte",
        style_centered
    ))

    elements.append(Spacer(1, 20))

    # Resultado de la consulta
    texto_consulta = [
        f"- Total de oraciones: {dic_rep['resumen']['total_oraciones']}",
        f"- Oraciones correctas: {dic_rep['consulta_3']['total_correctas']}",
        f"- Oraciones con errores: {dic_rep['consulta_3']['total_errores']}",
        
    ]

    elements.append(Paragraph("Resultados:", style_body))
    elements.append(Spacer(1, 10))
    for linea in texto_consulta:
        elements.append(Paragraph(linea, style_body))
        
    elements.append(PageBreak())

    # Cuarta consulta: Cantidad de errores por reporte

    elements.append(Paragraph("4) Cantidad de errores por reporte", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico

    elements.append(Paragraph(
        "Descripción: Para el batch solicitado, se obtiene la cantidad de errores por cada reporte incluido. Para esto se utilizó la tabla Corrections. En este caso, una oración puede poseer errores en más de una categoría diferente.",
        style_body
    ))

    elements.append(Spacer(1, 10))

    # Insertar gráfico
    ruta_grafico = dic_rep['images_paths'][3]

    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Tabla 2: Cantidad de errores por reporte",
        style_centered
    ))

    elements.append(Spacer(1, 20))




    # Resultado de la consulta
    texto_consulta = [
        f"- Total de errores Funcionales: {dic_rep['consulta_4']['total_funcional']}  ;  {dic_rep['consulta_4']['e1']}%", #e1
            
        f"- Total de errores Terminológicos: {dic_rep['consulta_4']['total_terminologico']}  ;  {dic_rep['consulta_4']['e2']}%", #e2
            
        f"- Total de errores Gramaticales: {dic_rep['consulta_4']['total_gramatical']}  ;  {dic_rep['consulta_4']['e3']}%", #e3
            
        f"- Total de errores: {dic_rep['consulta_4']['total_errores']}"
    ]

    elements.append(Paragraph("Resultados:", style_body))
    elements.append(Spacer(1, 10))
    for linea in texto_consulta:
        elements.append(Paragraph(linea, style_body))

    elements.append(PageBreak())

    # Quinta consulta: 15 palabras más corregidas por usuario

    elements.append(Paragraph("5) Top 15 palabras más corregidas por usuario", style_heading))

    elements.append(Spacer(1, 10))

    # Descripción y gráfico

    elements.append(Paragraph(
        "Descripción: Para el batch solicitado, se obtiene las 15 palabras más corregidas por el usuario. Se ignoraron stopwords y palabras compuestas úniamente de números. Se destacan en rojo aquellas palabras incluidas en el top 15 de palabras más repetidas del batch.",
        style_body
    ))

    elements.append(Spacer(1, 10))

    # Insertar gráfico
    ruta_grafico = dic_rep['images_paths'][4]

    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones

    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 3: Top 15 palabras más corregidas por usuario",
        style_centered
    ))

    elements.append(PageBreak())


    # Sexta consulta: 15 palabras más repetidas del batch

    elements.append(Paragraph("6) Top 15 palabras más repetidas del batch", style_heading))

    elements.append(Spacer(1, 10))

    # Descripción y gráfico

    elements.append(Paragraph(
        "Descripción: Para el batch solicitado, se obtiene las 15 palabras más repetidas del batch. Se ignoraron stopwords y palabras compuestas úniamente de números.\n Se destacan en rojo aquellas palabras incluidas en el top 15 de palabras más corregidas por el usuario.",
        style_body
    ))

    elements.append(Spacer(1, 10))

    # Insertar gráfico
    ruta_grafico = dic_rep['images_paths'][5]

    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones

    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 4: Top 15 palabras más repetidas del batch",
        style_centered
    ))

    elements.append(PageBreak())

    # Generar el PDF
    pdf.build(elements)

    tiempo_final = time.time()
    tiempo_ejecucion = tiempo_final - tiempo_inicial
    print(f"El tiempo de ejecución fue de {tiempo_ejecucion} segundos")


if __name__ == "__main__":
    print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
    sys.exit(1)