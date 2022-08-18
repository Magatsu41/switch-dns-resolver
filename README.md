# Nintendo Switch Browser Access
Ceci est un projet expérimental visant à accéder au navigateur internet sur la Nintendo Switch. 

Le principe est indentique à SwitchBRU, à l'exception qu'ici le programme s'execute chez vous.

Le fonctionnement est simple : la switch tente de s'autentifier sur les serveurs de Nintendo, nous interceptons cette requète à l'aide d'un DNS hijacking pour lui renvoyer une page html de notre choix. La switch obtenant un code HTTP 200 mais sans recevoir en header le X-Origin satisfaisant, elle déduis qu'un portail captif est présent sur le réseau, puis ouvre son navigateur interne pour l'afficher. Dès lors on peut accéder au reste du web via notre portail custom car toute les autres résolutions DNS sont effectuées normalement.

Ce programme tourne en NodeJS, crédit à https://peteris.rocks/blog/dns-proxy-server-in-node-js-with-ui/ pour la partie DNS hijacking dont je me suis inspiré.

## Installation / utilisation

près requis :

    - npm en version 7 ou plus

Clonnez ce repo git sur votre pc à l'endroit de votre choix (ce pc doit être sur le même réseau que votre Nintendo Switch).

Ouvrez un terminal de commande dans ce dossier.

Effectuez la commande "npm install" pour récupérer les différents modules.

Lancer le serveur avec la commande "npm start", vous devriez obtenir le résultat suivant :

```
> switch-dns-resolver@1.0.0 start ~/switch-dns-resolver
> node index.js

DNS server listening on { address: '0.0.0.0', family: 'IPv4', port: 53 }
Web Server listening on 127.0.0.1, port 80
IP locale : XXX.XXX.X.XX
```

Prenez bien en note l'IP locale d'affichée (c'est l'adresse de votre pc sur le réseau, celle qu'il faudra renseigner dans les paramètres de la Switch).

### Sur votre Switch :

Rendez vous dans paramètres > internet

Ici sélectionnez votre connexion (votre Wifi ou votre connexion cablée).

Modifiez les paramètres de celle-ci :

Choisissez de configurer le serveur DNS manuellement, puis en DNS primaire saisissez l'IP locale affichée plus tôt dans le terminale.

Validez puis choisissez de vous connecter à ce réseau, la Switch va tenter de ce connecter, puis affichera qu'il faut vous autentifier, faite suivant, voila vous êtes dans le navigateur de la Switch :)

## Désactivation

Pour désactiver cette fonctionnalité et réutiliser votre connexion normalement, remettez simplement les réglages des serveurs DNS en mode automatique.

## Remarques

Ceci est expérimental, des améliorations peuvent être apportées. Notez également que le navigateur de la Switch est limité et que certain sites peuvent ne pas s'afficher correctement.

## Axes d'amélioration

Comme la requète vers les serveurs de test de connexion n'est jamais satisfaite, la Switch a tendance à spammer les requètes en arrière plan pendant la navigation, ce qui fini par saturer le navigateur et le serveur DNS. La solution serait de mettre en cache la 1ere requète, et si une requète proxyfiée est présente en cache, simplement renvoyer un HTTP 200 avec en header le "X-Origin: Nintendo" pour satisfaire la requète.

## Remerciements :

- [SwitchBRU](https://www.switchbru.com/dns/)
 - [Peteris Rocks](https://peteris.rocks/blog/)