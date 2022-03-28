# ProjectO

## Subjects and characterization
- Technology Provider (TP)
- Logistic Operator (LO)
- Water Stream Provider (WSP)
- Water User (WU)

WSP and WU have 2 distinct _value chain_
- Water value chain
- Business value chain
TP and LO don't have a _water value chain_ (to be optimized) inside their business.

WSP can be a subject that provide a _stream of clean water_ (e.g. municipality - it depends dalle political roles of the state)

It has an economical return on that. This economical return is the main return on the _business value chain_.

In this case the _water value chain_ is intrinsically linked with the _business value chain_.

WSP can also be a subject that provide a _wastewater stream_.

It's main return on the _business value chain_ is not directly linked to the _water value chain_ (Industry and Agriculture have their business) but they are interested/forced for law restrictions, in invest in
- new technologies (from TP) = **treatment**
- new use for wastewater (to WU) = **disposal**

The disposal can be ported inside their actual _water value chain_, in this case we have a **reuse** but the **reuse** involves the invest in new technologies

WU is a subject at the end of the _water value chain_ it use water to generate a product (Agriculture is an example)

WU is a subject (operating in industry or Agriculture) that use a _stream of clean water_ ad generate wastewater plus a product. The product is the main economical return for it's business.

WU can be a single or a community interested in **treatment** for a better water or in stocking water for geographical or discontinuous water flow reasons.   

The difference between WU and the WSP of _wastewater stream_ is linked to the _water value chain_ inside the subject.
Then is _water value chain_ that identifies the subject.  
It's for this reason that the two subject are at least the same subject - if a WU in industry (It is identified to be a WU because it take _clean water_ and produce a product that is the main objective for it's _business value chain_) can **dispose** of water to lift up the actual _water value chain_ here the WU became a WSP for itself or for other subjects.

## User profiling

The user profiling can be done make the user select between 3 Subjects - by the main businness type (WU/WWSP WSP TP LO)

1. Water / wastewater - for this kind of users we are going to provide an interface where they can provide their actual _water value chain_ (node_red flows)
2. Technology Operator - for this kind of users we are going to provide an interface where they can provide their products (node_red nodes)
3. Logistic Operator

In case one the value chains we want to optimize are both _water value chain_ and _business value chain_ for the others it's only the _business value chain_ in this optic the last two subjects can be ignored.

The _water value chain_

According to the optics of the project the optimal solution for _water value chain_ is a closed loop for the water.

                 _________
                |         |
        ----->> |   WvC   | ----->> wastewater
                |_________|

        Total reuse of wastewater       
        ____________________________          
        |         _________        |
        |        |         |       |
        |----->> |   WvC   | ----->|
                 |_________|


The ideal case expect a treatment to bring back the same quality levels and a disposal inside the basin

A WU can be interested in treatment investments to have a economic return or ecological return (social)

A WSP (clean or wastewater) can be interested in treatment investments if there is a subject (WU) who is ready to consume the treated water becouse they can make the investment directly but they need to provide a better water for law restrictions or they want to invest for ecological reason but they don't want the new technology at home.

Il WSP (clean water) can interested in energy technologies (dams) for economical or/and ecological(social) reasons.

## Actions

A WU (ENV) create Water Requests and see Water Offer & Water Treatment
- Buy treated water for use in their process
- Implement water treatment system

A WSP create Water Offers an see Water Requests
Best water buyer based on
- proximity
- water quality
- flow target

## Technology Provider

The TP must insert the domain about the technology

Mack water

Screening and grit removal
Primary Clarifier
Biological treatment (ASP)
Disinfection

Reclaimed water - acqua bonificata
