import sortingview as sv

W = sv.load_workspace('workspace://6e387e9872f585f8e75061186615079bbbfd22d5221c5a17de16db4ed5cbeaaa')

F = W.figurl()

url = F.url(label='Example SortingView workspace', channel='ccm')
print(url)
