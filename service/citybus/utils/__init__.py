import json

def format_dict(dict):
    for key in dict.keys():        
        if isinstance(dict[key],str) and len(dict[key])>0 and (dict[key][0] == '{' and dict[key][-1] == '}'):
            temp = json.loads(dict[key])
            dict[key] = format_dict(temp)
    return dict
