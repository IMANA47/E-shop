# Guide de Test Complet (A-Z) - API E-Shop Backend (Édition Resend)

Ce guide repensé vous permet de vérifier le système logiciel en évitant les erreurs de Postman, et utilisant le système Resend pour la réception d'e-mails, ainsi que l'affichage des codes secrets en direct dans le terminal Node.

## ⚙️ Préparation du Terrain

1. Sur **Resend.com**, copiez d'abord votre Clé API.
2. Allez dans le fichier `.env` de votre code et insérez la ligne `RESEND_API_KEY="re_votre_cle_api"`.
3. Assurez-vous ensuite d'avoir redémarré votre Terminal : `pnpm run start:dev` (si vous ne le redémarrez pas, les variables modifiées du `.env` ne seront pas activées).
4. **⚠️ IMPORTANT POUR POSTMAN :** Pour toutes les requêtes que nous allons faire ci-dessous, allez dans l'onglet *Headers* (En-têtes) de Postman et vérifiez que vous avez bien mis :
   - `Content-Type`  | `application/json`

---

## 🧍 Étape 1 : Le Parcours Utilisateur & Authentification

### 1.1 Inscription (Tester l'envoi d'e-mail Resend)
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/auth/register`
- **Body (raw > JSON)**:
  ```json
  {
    "name": "Moi Meme",
    "email": "remplacer_par_l_email_de_votre_compte_resend@gmail.com",
    "password": "Password123!",
    "phone": "0601020304",
    "address": "10 rue de Paris"
  }
  ```
  *(Attention : Vous devez obligatoirement utiliser votre VRAIE adresse, celle inscrite sur Resend, car la formule gratuite bloque les e-mails vers des inconnus).*
- **Résultats attendus** : 
   - Postman vous répond : 201 "User registered".
   - Votre console VS Code affiche : `🎯 ---- CODE OTP GÉNÉRÉ POUR ... ---- 🎯`
   - Vous devriez recevoir le vrai e-mail dans votre vraie boîte aux lettres.

### 1.2 Activer son compte via OTP
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/auth/verify-account`
- **Body (JSON)**:
  ```json
  {
    "email": "votre_email_utilise_au_desssus@gmail.com",
    "otpCode": "123456"  // Remplacer par celui vu dans le terminal ou l'e-mail
  }
  ```
- **Résultat attendu** : "Account activated successfully".

### 1.3 Obtenir la clé système (JSON Web Token)
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/auth/login`
- **Body (JSON)**:
  ```json
  {
    "username": "votre_email_utilise_au_desssus@gmail.com",
    "password": "Password123!"
  }
  ```
- **Résultat attendu** : Postman va renvoyer un champ `access_token` très long. Copiez-le sans les guillemets !

---

## 🔒 Étape 2 : Opérations Sécurisées

> [!IMPORTANT]
> Pour tester la suite, vous devez dire à Postman prouver que vous êtes connecté.
> Cliquez sur l'onglet **Authorization** de votre requête, choisissez la méthode **Bearer Token** et collez-y votre `access_token`.
> Si vous ne le faites pas, l'API vous insultera de `Unauthorized 401`.

### 2.1 Créer un produit (Autorisé uniquement aux comptes du magasin)
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/products`
- **Body (JSON)**:
  ```json
  {
    "name": "Tablette Android Samsung",
    "description": "256Go de Stockage.",
    "price": 299.99,
    "stock": 5,
    "image": "https://img.com/tablette.jpg"
  }
  ```
- **Résultat attendu** : Produit créé (Mémorisez l'`id` retourné, par exemple `1`).

### 2.2 Créer une nouvelle commande client
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/orders`
- **Body (JSON)**:
  ```json
  {
    "items": [
      {
        "productId": 1,
        "quantity": 2,
        "price": 299.99
      }
    ]
  }
  ```
- **Résultat attendu** : La base de données va multiplier automatiquement `quantity * price` pour calculer le `total` ; et surtout, si vous repartez lister les produits (étape 2.1), vous verrez que le stock de la tablette est passé automatiquement de 5 à 3 !

---

## 🔑 Étape 3 : Scénario Oubli de Mot de passe

### 3.1 Faire la demande
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/auth/forgot-password`
- **Body (JSON)**:
  ```json
  {
    "email": "votre_email_utilise_au_desssus@gmail.com"
  }
  ```
- **Résultat attendu** : Un nouveau code OTP différent va vous être envoyé par email et imprimé dans la console du terminal Nest.

### 3.2 Forcer la modification
- **Méthode** : `POST`
- **URL** : `http://localhost:3000/auth/reset-password`
- **Body (JSON)**:
  ```json
  {
    "email": "votre_email_utilise_au_desssus@gmail.com",
    "otpCode": "LE_CODE_RECUPERE",
    "newPassword": "UnNouveauSuperMotDePasse"
  }
  ```
- Vous pouvez désormais relancer un `login` avec votre nouveau mot de passe !
