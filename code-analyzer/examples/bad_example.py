# Bad Python Example - Lots of Issues

import os
import sys
import json
import time

def process_data(data):
    if data:
        if len(data) > 0:
            if isinstance(data, list):
                for i in range(len(data)):
                    print(data[i])  # Should use logging
                    if data[i] == None:
                        result = data[i]
                        print(result)

def another_function():
    var1 = 10
    var2 = 20
    var3 = var1 + var2
    var4 = var1 * var2
    var5 = var1 - var2
    var6 = var1 / var2
    return var1, var2, var3, var4, var5, var6

# Very long function
def very_long_function():
    step1 = 1
    step2 = 2
    step3 = 3
    step4 = 4
    step5 = 5
    step6 = 6
    step7 = 7
    step8 = 8
    step9 = 9
    step10 = 10
    step11 = 11
    step12 = 12
    step13 = 13
    step14 = 14
    step15 = 15
    step16 = 16
    step17 = 17
    step18 = 18
    step19 = 19
    step20 = 20
    step21 = 21
    step22 = 22
    step23 = 23
    step24 = 24
    step25 = 25
    step26 = 26
    step27 = 27
    step28 = 28
    step29 = 29
    step30 = 30
    return step1 + step30

except:
    pass

var_with_underscore = 10
varWithCamelCase = 20
