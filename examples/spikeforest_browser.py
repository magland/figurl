import figurl as fig

F = fig.Figure('spikeforest.browser.1', {
    'uri': 'sha1://52f24579bb2af1557ce360ed5ccc68e480928285/file.txt?manifest=5bfb2b44045ac3e9bd2a8fe54ef67aa932844f58'
})

url = F.url(label='spikeforest browser')

print(url)