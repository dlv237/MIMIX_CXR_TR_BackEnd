from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import sys
import os
import time

from utils.images_dict_creator_batch import create_images_dict


def create_report_for_batch(batch_id, user_id):
    tiempo_inicial = time.time()
    
    dic_rep =  create_images_dict(batch_id, user_id)  
    
    pdf = SimpleDocTemplate(dic_rep['pdf_path'], pagesize=letter)
    
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
        f"- Cantidad de usuarios incluidos: {len(dic_rep['resumen']['users_id'])}",
        f"- Id de usuarios: {', '.join(dic_rep['resumen']['users_id'])}",
        f"- Modelo utilizado: {dic_rep['resumen']['modelo']}",   
        f"- Cantidad de oraciones incluidas: {dic_rep['resumen']['total_oraciones']}",
    ]
    
    for linea in resumen:
        elements.append(Paragraph(linea, style_body))
    elements.append(Spacer(1, 30))
    
    # Primera consulta: Porcentaje de oraciones de batch con al menos un error
    elements.append(Paragraph("1) Cantidad de oraciones con error po usuario", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico
    elements.append(Paragraph(
        "Descripción: Se obtiene la cantidad de oraciones que presentan al menos un error en el batch analizado. Cada color representa un tipo de error que se ha encontrado en las oraciones.",
        style_body
    ))
    elements.append(Spacer(1, 10))
    
    ruta_grafico = dic_rep['image_paths'][0]
    
    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 1: Cantidad de errores encontrados por usuario y sus respectivos tipos", 
        style_centered
    ))
    elements.append(Spacer(1, 40))
    
    elements.append(PageBreak())
    
    
    elements.append(Paragraph("2) Índice de concordancia por pares de usuarios (Palabra - Tipo de error)", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico
    elements.append(Paragraph(
        "Descripción: Se obtiene el índice de concordancia por pares para cada par de usuarios en el batch analizado. Cada color representa qué tan concordantes son las anotaciones de los usuarios. Se evalúan las tuplas (Palabra, Tipo de error).",
        style_body
    ))
    elements.append(Spacer(1, 10))
    
    ruta_imagen = os.path.join('stats', 'utils',  'batch_all_users_query2_explication.png')
    
    imagen = Image(ruta_imagen, width=868 * 0.55, height=318 * 0.55)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 20))
    
    ruta_grafico = dic_rep['image_paths'][1]
    
    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 2: Heatmap de concordancia entre usuarios, considerando palabra sin oración",
        style_centered
    ))

    elements.append(Spacer(1, 20))
    
    texto_consulta = [
        f"- Errores en común entre todos los usuarios: {dic_rep['dato_1']}",
        f"- Errores diferentes entre todos los usuarios: {dic_rep['dato_2']}",
        f"- Métrica de acuerdo global (consistencia general): {dic_rep['dato_3']}"       
  
    ]


    elements.append(Paragraph("Resultados:", style_body))
    elements.append(Spacer(1, 10))
    for linea in texto_consulta:
        elements.append(Paragraph(linea, style_body))

    elements.append(PageBreak())
    
    
    ##################
    
    
    elements.append(Paragraph("3) Palabras más repetidas del batch (sin oración)", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico
    elements.append(Paragraph(
        "Descripción: Para el batch solicitado, se obtienen las 15 palabras más corregidas por los usuarios (unicamente palabra, no palabra-oración). Se presentan junto a la cantidad de veces que fue etiquetada como cada tipo de error.",
        style_body
    ))
    elements.append(Spacer(1, 10))
    
    ruta_grafico = dic_rep['image_paths'][2]

    imagen = Image(ruta_grafico, width=3013*0.14, height=1841*0.14)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 10))

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 3: Gráfico de barras apiladas con las 15 palabras más repetidas del batch, junto a sus tipos de error",
        style_centered
    ))

    elements.append(Spacer(1, 20))
    elements.append(PageBreak())
    
    
    
    
    
    ##################
    
    elements.append(Paragraph("4) Palabras más repetidas del batch (con oración)", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico
    elements.append(Paragraph(
        "Descripción: Para el batch solicitado, se obtienen las 15 palabras de oración más corregidas por los usuarios (se utilizó la tupla (palabra, oración_id) ). Se presentan junto a la cantidad de veces que fue etiquetada como cada tipo de error.",
        style_body
    ))
    elements.append(Spacer(1, 10))
    
    ruta_grafico = dic_rep['image_paths'][3]

    imagen = Image(ruta_grafico, width=3554*0.14, height=1766*0.14)  # Ajustar dimensiones
    elements.append(imagen)
    
    elements.append(Spacer(1, 20))
    

    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 4: Gráfico de barras apiladas con las 15 palabras de oración más repetidas del batch, junto a sus tipos de error",
        style_centered
    ))
    
    elements.append(Spacer(1, 20))
    elements.append(PageBreak())
    
    
    elements.append(Paragraph("5) Índice de concordancia por pares de usuarios (Palabra - Tipo de error - ID_Oración)", style_heading))
    elements.append(Spacer(1, 10))

    # Descripción y gráfico
    elements.append(Paragraph(
        "Descripción: Se obtiene el índice de concordancia por pares para cada par de usuarios en el batch analizado. Cada color representa qué tan concordantes son las anotaciones de los usuarios. Se evalúan las tuplas (Palabra, Tipo de error, Id_oración).",
        style_body
    ))
    elements.append(Spacer(1, 10))
    
    ruta_grafico = dic_rep['image_paths'][4]
    
    imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
    elements.append(imagen)
    elements.append(Spacer(1, 10))
    
    # Texto debajo del gráfico (centrado)
    elements.append(Paragraph(
        "Gráfico 5: Heatmap de concordancia entre usuarios, considerando palabra-oración",
        style_centered
    ))
    
    elements.append(PageBreak())
    
    
    
    elements.append(Paragraph("6) Tabla de las 15 oraciones con mayor número errores", style_heading))
   
    
    ruta_grafico = dic_rep['image_paths'][5]
    
    imagen = Image(ruta_grafico, width=456*0.96, height=636*0.96)  # Ajustar dimensiones
    elements.append(imagen)
    
    pdf.build(elements)
    
    print(f"Tiempos de ejecución: {time.time() - tiempo_inicial} segundos")

if __name__ == "__main__":
    print("Uso: python report_creator.py <batch_id: int> <user_id: int or all>")
    sys.exit(1)