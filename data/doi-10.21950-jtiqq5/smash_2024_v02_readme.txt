e-cienciaDatos: "readme" form 

-------------------
GENERAL INFORMATION
-------------------
1. Title of dataset
Spanish MArket's Smart Home devices (SMASH)

DOI: https://doi.org/10.21950/JTIQQ5

2. Contact
   Principal Investigator Contact Information
        Name: Mohammed Rashed
        Institution: Universidad Carlos III de Madrid
        Email: mrashed@inf.uc3m.es
	ORCID: 0000-0002-0119-0796

3. Description of the project
The collection of this dataset is part of ongoing research on privacy in smart homes done at the COmputer SECurity (COSEC) research group, Computer Science and Engineering department, Universidad Carlos III de Madrid.

4. Description of the dataset
The SMASH dataset contains data on smart home devices sold on 4 Spain-based e-commerce platforms: Amazon Spain, PC Componentes, MediaMarkt Spain and El Corte Inglés. It contains data on 5218 devices belonging to 652 brands classified into 49 categories. The devices in our dataset have been sold at least 2.5 million times based on the number of user reviews. It can be useful for researchers in the areas of consumer behavior, microeconomics, IoT, smart home and computing.


5. Notes

6. Deposit date
17 December, 2024

7. Date

8. Language
English, Spanish

--------------------------
AUTHOR INFORMATION
--------------------------
1. Author
        Name: Jhovany Antonio
        Last name  : Quintana Vera
        Institution: Universidad Carlos III de Madrid
        Email: jhquinta@inf.uc3m.es
	ORCID: 0009-0007-5212-2578

2. Author
        Name: Ana Isabel
        Last name  : González-Tablas Ferreres
        Institution: Universidad Carlos III de Madrid
        Email: aigonzal@inf.uc3m.es
	ORCID: 0000-0002-6259-8955

3. Author
        Name: Mohammed
        Last name  : Rashed
        Institution: Universidad Carlos III de Madrid
        Email: mrashed@inf.uc3m.es
	ORCID: 0000-0002-0119-0796

--------------------------
METHODOLOGY
--------------------------
1. Methodology


2. Software
Python
 
--------------------------
KEYWORDS
--------------------------
1. Keywords
IoT, Smart Home, Home Automation, consumer electronics, domótica, e-commerce

--------------------------
SPONSORSHIP INFORMATION AND GRANT IDs
--------------------------
1. Grant Information
- Recualificación-Margarita Salas grant (call of Universidad Carlos III Madrid) financed by the Ministerio de Ciencia, Innovación y Universidades and the European Union-Next Generation EU. 
- European Defence Industrial Development Programme (EDIDP) under grant agreement No. EDIDP-CSAMN-SSC-2019-022-ECYSAP (European Cyber Situational Awareness Platform).
- Ministerio de Ciencia, Innovación y Universidades under Grant No. TIN2016-79095-C2-2-R (SMOG).


--------------------------
RELATED PUBLICATIONS
--------------------------
1. Related publication


2. Related dataset


--------------------------
GEOGRAPHIC INFORMATION
--------------------------
1. Spatial coverage
Spain


--------------------------
TEMPORAL INFORMATION
--------------------------
1. Time period coverage
December 2023 - August 2024


--------------------------
FILES
--------------------------
1. Files 

- smash_2024_v02_readme.txt = documentation


- smash_2024_v02.tsv = data

The file has 16 columns that contain information about the devices in our dataset. It contains a set of 5218 entries (rows) plus the header row.

The columns in the dataset are:
A.	id: field used to uniquely identify each register in the table (integer number in text format) 
B.	name: includes the full name of the product as extracted from the product name label on the webpage (text)
C.	price: refers to the selling price of the product (numeric, with the dot ‘.’ used as decimal separator) 
D.	brand: indicates the name of the brand as extracted from the webpage of the product (text)
E.	model: is the model name as designated by the product’s webpage (text)
F.	code: a field titled code that can either be a universal code or an internal code of the product (text) 
G.	rating: the rating of the product based on the 5-star reviewing system (numeric, with the dot ‘.’ used as decimal separator, or text ‘NULL’)
H.	reviews: the number of reviews available on the product’s webpage (numeric, with the dot ‘.’ used as decimal separator, or text ‘NULL’)
I.	link: the link from which the data was extracted (url)
J.	currency: the currency used in the sales of the product (EUR)
K.	platform: the platform from which the data was extracted. There are four platforms: Amazon, PC Componentes, El Corte Inglés, MediaMarkt (text) 
L.	Category-ES: Category as designated by the platform and shown on the product’s webpage in the official webpage (text)
M.	Category-EN: An English translation of the Category-ES field (text)
N.	Macro-Category-ES: A higher level category that we create in order to normalize the diverse categories that the platforms assign to the products (text)
O.	Macro-Category-EN: An English translation of the Macro-Category-ES (text)
P.	date: the date of collection of the data  from the product’s webpage – Central European Time. The time of collection ranges between December 2023 and August 2024 (date, format YYYY/MM/DD HH-MM-SS)



1. name: includes the full name of the product as extracted from the product name label on the webpage 
2. price: refers to the selling price of the product. We assigned a ‘0’ value when the price was unavailable in the dedicated field.
3. brand: indicates the name of the brand as extracted from the webpage of the product
4. model: is the model name as designated by the product’s webpage
5. code: a field that is internal code for MediaMarkt and PC Componentes (likely the Stock Keeping Unit (SKU)), the European Article Number (EAN) for El Corte Inglés and the Amazon Standard Identification Number (ASIN) for Amazon 
6. rate: the rating of the product based on the 5-star reviewing system
7. reviews: the number of reviews available on the product’s webpage
8. link: the link from which the data was extracted
9. currency: the currency used in the sales of the product (Euro)
10. platform: the platfom from whch the data was extracted. There are four platforms: Amazon, PC Componentes, El Corte Inglés, MediaMarkt. 
11. Category-ES: Category as designated by the platform and shown on the product’s webpage in the official webpage.
12. Category-EN: An English translation of the Category-ES field 
13. Macro-Category-ES: A higher level category that we create in order to normalize the diverse categories that the platforms assign to the products
14. Macro-Category-EN: An English translation of the Macro-Category-ES
15. date: the timestamp of the of collection of the data from the product’s webpage – Central European Time. The time of collection ranges between December 2023 and August 2024

--------------------------
LICENSES AND PRIVACITY
--------------------------
1. Licenses
CC-BY-NC
https://creativecommons.org/licenses/by-nc/4.0/deed.en

2. Privacity


--------------------------
OTHERS
--------------------------
1. Data dictionary





