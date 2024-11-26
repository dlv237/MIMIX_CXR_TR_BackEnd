from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import sys
import os
from images_dict_creator import create_images_dict
import time

tiempo_inicial = time.time()


#Obtenemos el batch_id y el user_id como argumentos de la linea de comandos
if len(sys.argv) != 3:
    print("Uso: python codigo.py <batch_id> <user_id>")
    sys.exit(1)
    
try:
    # Obtener los valores de los argumentos
    batch_id = int(sys.argv[1])
    user_id = int(sys.argv[2])
    
    print(f"Creando reporte para el batch {batch_id} y el usuario {user_id}")


except ValueError:
    print("Error: batch_id y user_id deben ser números enteros.")
    sys.exit(1)


# Cramos las imagenes y obtenemos el diccionario de reporte
dic_rep = create_images_dict(batch_id, user_id)

print("Diccionario de reporte creado")

    
# Crear el PDF
pdf = SimpleDocTemplate(f"batch_{batch_id}_report.pdf", pagesize=letter)

# Estilos para el texto
styles = getSampleStyleSheet()
style_title = styles["Title"]
style_heading = styles["Heading2"]
style_body = styles["BodyText"]

# Estilo para texto centrado
style_centered = ParagraphStyle(
    name="Centered",
    parent=styles["BodyText"],
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
ruta_grafico = os.path.join("images", "batch_error.png")

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
    f"- Porcentaje de oraciones con al menos un error: {dic_rep['consulta_1']['errores'] / dic_rep['resumen']['total_oraciones'] }%",
    f"- Porcentaje de oraciones corectas: {dic_rep['consulta_1']['correctas'] / dic_rep['resumen']['total_oraciones'] }%",
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

ruta_grafico = os.path.join("images", "batch_tipo_error.png")

imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
elements.append(imagen)
elements.append(Spacer(1, 10))

# Texto debajo del gráfico (centrado)
elements.append(Paragraph(
    "Gráfico 2: Cantidad de oraciones que presentan cada tipo de error",
    style_centered
))

elements.append(Spacer(1, 20))

total_errores = dic_rep["consulta_2"]["e_funcional"] + dic_rep["consulta_2"]["e_gramatical"] + dic_rep["consulta_2"]["e_terminologico"]
# Resultado de la consulta
texto_consulta = [
    f"- Errores de tipo Funcional: {dic_rep['consulta_2']['e_funcional']} ; {dic_rep['consulta_2']['e_funcional'] / (total_errores) * 100:.2f}%",
    f"- Errores de tipo Gramatical: {dic_rep['consulta_2']['e_gramatical']}, {dic_rep['consulta_2']['e_gramatical'] / total_errores * 100:.2f}%",
    f"- Errores de tipo Terminológico: {dic_rep['consulta_2']['e_terminologico']}, {dic_rep['consulta_2']['e_terminologico'] / total_errores * 100:.2f}%",
    f"- Total de errores: {total_errores}"
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
ruta_grafico = os.path.join("images", "tabla_resultados.png")

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
ruta_grafico = os.path.join("images", "tabla_resultados_2.png")

imagen = Image(ruta_grafico, width=400, height=300)  # Ajustar dimensiones
elements.append(imagen)
elements.append(Spacer(1, 10))

# Texto debajo del gráfico (centrado)
elements.append(Paragraph(
    "Tabla 2: Cantidad de errores por reporte",
    style_centered
))

elements.append(Spacer(1, 20))




total_errores = dic_rep["consulta_4"]["total_funcional"] + dic_rep["consulta_4"]["total_gramatical"] + dic_rep["consulta_4"]["total_terminologico"]
# Resultado de la consulta
texto_consulta = [
    f"- Total de errores Funcionales: {dic_rep['consulta_4']['total_funcional']}  ;  {dic_rep['consulta_4']['total_funcional'] / (total_errores) * 100:.2f}%",
    f"- Total de errores Terminológicos: {dic_rep['consulta_4']['total_terminologico']}  ;  {dic_rep['consulta_4']['total_terminologico'] / (total_errores) * 100:.2f}%",
    f"- Total de errores Gramaticales: {dic_rep['consulta_4']['total_gramatical']}  ;  {dic_rep['consulta_4']['total_gramatical'] / (total_errores) * 100:.2f}%",
    f"- Total de errores: {total_errores}"
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
    "Descripción: Para el batch solicitado, se obtiene las 15 palabras más corregidas por el usuario. Se ignoraron stopwords y palabras compuestas úniamente de números.",
    style_body
))

elements.append(Spacer(1, 10))

# Insertar gráfico
ruta_grafico = os.path.join("images", "user_15_palabras.png")

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
ruta_grafico = os.path.join("images", "batch_15_palabras.png")

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
