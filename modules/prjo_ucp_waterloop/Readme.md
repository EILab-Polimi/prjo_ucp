## Approccio mappa




## Multistep con tabelle
Se dovessimo inserire una libreria js per gestire le tabelle oltre a datatables considera
http://www.jquery-bootgrid.com/


Vista l'impostazione di creazione di un water loop attraverso un form multistep aggiungo le seguenti considerazioni


> - se water loop (WL) viene creato da water user, water provider, l'algoritmo prima fa un matching tra qualità dell'acqua proposta e standard dell'acqua richiesta, rispetto all'application field e poi propone una technology
> - se WL viene creato da technology provider, l'algoritmo propone tutti i possibili match tra water user e water provider negli application field scelti dal technology provider

In sostanza si deriva che il flusso di creazione di un _Water Loop_ viene determinato dalla role dell'utente (**Water user**, **Water Provider**, **Technology provider**) e dall'application field che è associato a _Water Stream_, _Water Demand_ e _Technology_.

Come evidenziato sopra, l'application field è un campo presente nel _Water Stream_, _Water Demand_ e _Technology_ (va a caratterizzare uno di questi contenuti) che potrebbe essere, si, sempre il medesimo per lo stesso user/group, ma potebbe differire.

#### Nel caso di una _Technology_
uno stesso user/group potebbe avere a disposizione tecnologie che agiscono/operano su più di un application field. (Multi prodotto)

#### Nel caso di un _Water Stream_
uno stesso user/group potrebbe operare in differenti application field, o, adottando una _Technology_ nei confronti di un _Water Stream_, potrebbe fornire acqua (un nuovo _Water Stream_) per un differente application field.

#### Nel caso di una _Water Demand_
similmente al caso precedente uno stesso user/group potrebbe essere interessato ad ottenere dei flussi d'acqua in relazione ad una delle sue _Water Demand_ che potrebbero non avere il medesimo application field.

Questa suddivisione serve anche per sottolineare che l'application field attualmente non è associato allo user/group ma bensì ai _Water Stream_, _Water Demand_ e _Technology_ che sono contenuti della piattaforma.

Ed inoltre, in origine, non si crea un Water Loop individuando **Water user** e **Water Provider** ma bensì selezionando _Water Stream_ e _Water Demand_ con, opzionale, una _Technology_.

Anche la derivazione della role (**Water user**, **Water Provider**, **Technology provider**) dal profilo utente limita il campo di azione dell'utente.


## Step 1 - Individuazione del soggetto che compone la richiesta
Proporrei di inserire un primo step nel form per selezionare la role l'application field in modo da avere gli input necessari per implementare gli step successivi.

Si potrà poi comunque sostituire questo primo step con dei dati derivati dalla role dello user.

## Step 2 - ?? Scelta del Water Stream ??
In base a quanto selezionato nello Step 1 si aprono differenti scenari in base alla role.

1. Role **Water Provider** - Un Water Provider sarà interessato a _utilizzare_ i propri water stream per la creazione del loop o, anche water stream di altri utenti.

Creazione di una doppia tabella con Sx External water stream Dx Your water stream **ordinati** secondo il ranking

No- in questo primo step il ranking non è applicabile in quanto non abbiamo il termine di paragone ne a livello geografico ne a livello quantitativo

Se utiliziamo una mappa possiamo visualizzare marker differenti in base allo user che ha creato il water stream ed indicare il flusso (parametro quantitativo) e le analisi (punteggio percentuale sulla base dei parametri rispettati)

> - ranking viene proposto sulla base di un punteggio percentuale sulla base dei parametri rispettati o non rispettati (rispetto allo standard previsto per lo specifico application field). Dovrà poi considerare anche un criterio di vicinanza geografica e un criterio quantitativo

2. Role **Water User** - Un Water User sarà interessato ad _individuare_ un water stream che possa soddisfare una delle sue _Water Demand_.

Possiamo quindi utilizzare la stessa logica di ranking che viene utilizzata al punto uno (nella colonna di Dx non comparirano Your Water Stream se il Water User è un utilizzatore puro o non ha inserito alcun Water Stream)

3. Role **Technology Provider** - Un Technology Provider sarà interessato ad _individuare_ un match tra _Water Stream_ e _Water Demand_ rispetto ad una delle proprie _Technology_

In questo step quindi selezionerà una tra le sue technology e verranno visualizzati una lista di water Stream Water Demand su due colonne ordinate per

Water Stream con flussi e parametri più lavorabili e water demand più vicine ai suddetti water Streams
