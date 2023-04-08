import requests
from bs4 import BeautifulSoup
import re
from PIL import Image
from PIL import ImageFont
from PIL import ImageDraw
from io import BytesIO

import sys

def parse(nick, kind):
    dict_kind2number = {
        "반지1" : 1,
        "모자" : 3,
        "뚝" : 3,
        "뚝배기" : 3,
        "엠블렘" : 5,
        "엠블럼" : 5,
        "엠블" : 5,
        "반지2" : 6,
        "펜던트2" : 7,
        "펜던2" : 7,
        "얼굴장식" : 8,
        "얼장" : 8,
        "뱃지" : 10,
        "반지3" : 11,
        "펜던트1" : 12,
        "펜던트" : 12,
        "펜던" : 12,
        "눈장식" : 13,
        "눈장" : 13,
        "귀고리" : 14,
        "귀걸이" : 14,
        "이어링" : 14,
        "훈장" : 15,
        "메달" : 15,
        "반지4" : 16,
        "무기" : 17,
        "상의" : 18,
        "견장" : 19,
        "어깨장식" : 19, 
        "보조" : 20,
        "보조무기" : 20,
        "포켓" : 21,
        "포켓아이템" : 21,
        "벨트" : 22,
        "하의" : 23,
        "장갑" : 24,
        "망토" : 25,
        "신발" : 28,
        "하트" : 30,
        "기계심장" : 30 
    }

    #########################################################
    #########################################################
    #########           Secret Codes Here           #########
    #########################################################
    #########################################################

    item = {}

    #########################################################
    #########################################################
    #########           Secret Codes Here           #########
    #########################################################
    #########################################################

    item["name"] = name
    item["grade"] = grade
    item["req"] = req
    item["able_class"] = able_class
    item["special_class"] = special_class
    item["kind"] = kind
    item["soul"] = soul
    item["etc"] = etc

    return item

def make_image(item, kind):
    # 0. 배경 이미지 생성

    # 가로 261px, 세로 800px의 RGBA 이미지 생성
    img = Image.new("RGBA", (261, 900), (255, 255, 255, 255))

    # save image
    img.save("output.png")


nick = sys.argv[1]
kind = sys.argv[2]

try:
    item = parse(nick, kind)
    make_image(item, kind)
    print("OK")
except Exception as e:
    print(e)
    print("ERROR")