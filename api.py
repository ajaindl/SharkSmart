from flask import Flask 
from flask_cors import CORS
from flask import jsonify
from flask import request
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder 
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report
from sklearn.cluster import KMeans



app = Flask(__name__) 
CORS(app)

@app.route('/shotmap')
def shotmap():
    result = main()
    result = jsonify(result)
    return result

@app.route('/predict', methods= ['POST'])
def predict():
    twopp = request.json['twopp']
    tpp = request.json['tpp']
    tppt = request.json['tppt']
    w = request.json['w']


    test_data = pd.DataFrame()
    test_data['3PP'] = [tpp]
    test_data['2PP'] = [twopp]
    test_data['3PPT'] = [tppt]
    test_data['Wins'] = [w]

    training_data = getTrainingData()

    result = classifyPredict(training_data["x"], training_data["y"], test_data)
    result = jsonify(result)
    return result



def main():
    training_set = pd.read_csv('training_set.csv')
    test_set = pd.read_csv('test_set.csv')

    X_train = training_set.drop('Playoffs', axis=1)
    Y_train = training_set['Playoffs']
    playoffs = test_set['Playoffs'].values

    tpa = training_set['2PA']
    tpm = training_set['2P']

    threepp = map(lambda x,y: x/y, training_set['3P'], training_set['3PA'])
    shotpct = map(lambda x,y: x/y, training_set['FG'], training_set['FGA'])
    threepapot = map(lambda x,y: x/y, training_set['3PA'], training_set['FGA'])

    tpp = pd.DataFrame(data = map(lambda x,y: x/y, tpm, tpa), columns = ['2PP'])

    tpp['3PP'] = pd.Series(threepp, index = tpp.index)
    tpp['3PPT'] = pd.Series(threepapot, index=tpp.index)
    tpp['Wins'] = training_set['W']

    testzero = map(lambda x,y:x/y, test_set['2P'], test_set['2PA'])
    testone = map(lambda x,y: x/y, test_set['3P'], test_set['3PA'])
    testtwo = map(lambda x,y: x/y, test_set['FG'], test_set['FGA'])
    testthree = map(lambda x,y: x/y, test_set['3PA'], test_set['FGA'])

    y_test = test_set['Playoffs']

    x_test = pd.DataFrame(data = testzero, columns = ['2PP'])

    x_test['3PP'] = pd.Series(testone, index = x_test.index)
    x_test['3PPT'] = pd.Series(testthree, index = x_test.index)
    x_test['Wins'] = test_set['W']

    X_set = tpp


    result = classify(X_set, Y_train, x_test, playoffs)
    return result

def getTrainingData():
    training_set = pd.read_csv('training_set.csv')
    test_set = pd.read_csv('test_set.csv')

    Y_train = training_set['Playoffs']
    tpa = training_set['2PA']
    tpm = training_set['2P']

    threepp = map(lambda x,y: x/y, training_set['3P'], training_set['3PA'])
    shotpct = map(lambda x,y: x/y, training_set['FG'], training_set['FGA'])
    threepapot = map(lambda x,y: x/y, training_set['3PA'], training_set['FGA'])

    X_train = pd.DataFrame(data = map(lambda x,y: x/y, tpm, tpa), columns = ['2PP'])

    X_train['3PP'] = pd.Series(threepp, index = X_train.index)
    X_train['3PPT'] = pd.Series(threepapot, index= X_train.index)
    X_train['Wins'] = training_set['W']

    res = { }
    res['x'] = X_train
    res['y'] = Y_train
    return res



def classify(x, y, x_test, playoffs = None):
    mlpc = MLPClassifier(hidden_layer_sizes=(12,24),max_iter=1000)
    mlpc.fit(x,y)
    pred_mlpc = mlpc.predict(x_test)
    res = {}
    twopp = x_test['2PP'].values
    tpp = x_test['3PP'].values
    tppt = x_test['3PPT'].values
    w = x_test['Wins'].values
    pp = pred_mlpc.tolist()
    
    length = len(pp)-1
    result = []

    for i in range(0, length):
        result.append({'twopp':twopp[i], 'tpp':tpp[i], 'tppt':tppt[i], 'w':int(w[i]), 'pp':pp[i], 'ap':int(playoffs[i]) })
    return result

def classifyPredict(x, y, x_test):
    mlpc = MLPClassifier(hidden_layer_sizes=(12,24),max_iter=1000)
    mlpc.fit(x,y)
    pred_mlpc = mlpc.predict(x_test)
    score = mlpc.score(x,y)
    result = {"playoffs" : int(pred_mlpc[0]), "score": score}
    return result


class ShotMap:
    def __init__(self, twopp, tpp, fgp, tppt, w, pp):
        self.twopp = twopp
        self.tpp = tpp
        self.fgp = fgp
        self.tppt = tppt
        self.w = w
        self.pp = pp
