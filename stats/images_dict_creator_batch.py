import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import nltk
from nltk.corpus import stopwords
import os
import json
import sys

from utils import execute_query_via_ssh, create_directory

def create_images_dict(batchId, userId):
    
    create_directory(batchId, userId)  
    
    dic_reporte = {
    "resumen":{"batchId":batchId, "userId":userId},
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

    join (select * from public."ReportGroupReports" where public."ReportGroupReports"."reportGroupId" = 1 ) rgr on rgr."reportId" = ts."reportId"

    group by cor."userId", cor."errorType";
    """
    
    respuesta = execute_query_via_ssh(consulta)
    
    
    