// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import {
    doc,
    getFirestore,
    collection,
    updateDoc,
    onSnapshot,
    getDocs,
    getDoc,
    setDoc,
    deleteDoc,
} from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyCUM5A_g__8iGunnWKMRlwnEO7oznytuFo',
    authDomain: 'e-commerce-f5615.firebaseapp.com',
    projectId: 'e-commerce-f5615',
    storageBucket: 'e-commerce-f5615.appspot.com',
    messagingSenderId: '236385334049',
    appId: '1:236385334049:web:73d0eeeb235809b7868460',
    measurementId: 'G-4XKJEH79Y6',
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();

const provider = new GoogleAuthProvider();
export const auth = getAuth();
const storage = getStorage();

// Dispatch Function for redux

export const AuthWithGoogle = async () => {
    let user = null;
    await signInWithPopup(auth, provider)
        .then((result) => {
            user = result.user;
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(`Some Error : ${errorCode}/${errorMessage}`);
        });
    return user;
};

export const UploadData = async () => {
    const q = collection(db, 'ProductsData');

    onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach(async (docdata) => {
            console.log(doc.id);
            const docRef = doc(db, `ProductsData/${docdata.id}`);
            await updateDoc(docRef, {
                uid: docdata.id,
            });
        });
    });
    // await Data.forEach( async element => {
    //   const docRef = await addDoc(collection(db, "ProductsData"),{
    //     name: element.name,
    //     uid: null,
    //     images:null,
    //     description: element.description,
    //     rating: element.rating,
    //     price: element.price,
    //     features:element.features
    //   });
    //   });
};

export const FetchCategoryData = async () => {
    let FetchData = {};
    const querySnapshot = await getDocs(collection(db, 'Category'));
    querySnapshot.forEach((doc) => {
        FetchData[doc.id] = doc.data();
    });
    return FetchData;
};

export const GetProductDataFromUid = async (uid) => {
    let ProductData = null;
    let Images = [];
    const docRef = doc(db, `ProductsData/${uid}`);
    const docSnap = await getDoc(docRef);

    for (let i = 1; i < 4; i++) {
        await getDownloadURL(ref(storage, `ProductsImages/${uid}/${i}.jpeg`))
            .then((url) => {
                Images.push(url);
            })
            .catch((error) => {
                console.log(error.message);
            });
        if (i === 3) {
            if (docSnap.exists()) {
                ProductData = {
                    ...docSnap.data(),
                    category: docSnap.id,
                    images: Images,
                };
            } else {
            }
        }
    }

    return ProductData;
};

export const AddProductToCard = async (uid, productData) => {
    const Ref = doc(db, `Users/${uid}/CardProducts/${productData.uid}`);
    const Snap = await getDoc(Ref);
    // New Product
    if (!Snap.exists()) {
        try {
            await setDoc(Ref, {
                quantity: 1,
                name: productData.name,
                price: productData.price,
                rating: productData.rating,
                image: productData.images[0],
            });
        } catch (error) {}
        // Existing Product
    } else if (Snap.exists()) {
        IncreaseCardProductQuantity(uid, productData.uid);
    }
};

export const IncreaseCardProductQuantity = async (uid, productUid) => {
    const Ref = doc(db, `Users/${uid}/CardProducts/${productUid}`);
    const Snap = await getDoc(Ref);
    if (Snap.data().quantity < 5) {
        if (Snap.exists()) {
            const value = Snap.data().quantity + 1;
            try {
                await updateDoc(Ref, {
                    quantity: value,
                });
            } catch (error) {
                console.log(error.message);
            }
        }
    }
};
export const DecreaseCardProductQuantity = async (uid, productUid) => {
    const Ref = doc(db, `Users/${uid}/CardProducts/${productUid}`);
    const Snap = await getDoc(Ref);
    if (Snap.exists()) {
        const value = Snap.data().quantity - 1;
        try {
            await updateDoc(Ref, {
                quantity: value,
            });
        } catch (error) {
            console.log(error.message);
        }
    }
};
export const DeleteCardProduct = async (uid, productUid) => {
    const Ref = doc(db, `Users/${uid}/CardProducts/${productUid}`);
    const Snap = await getDoc(Ref);
    if (Snap.exists()) {
        try {
            await deleteDoc(Ref);
        } catch (error) {
            console.log(error.message);
        }
    }
};

export const AddAddressToFirebase = async (Data, UserUid) => {
    const Ref = doc(db, `Users/${UserUid}`);
    // const Snap = await getDoc(Ref);
    try {
        await setDoc(Ref, {
            Address: {
                name: Data.name,
                mobile_number: Data.mobile_number,
                country: Data.country,
                state: Data.state,
                district: Data.district,
                city_town: Data.city_town,
                pin: Data.pin,
                landmark: Data.landmark,
            },
        });
    } catch (error) {
        console.log(error.message);
    }
};

export const FetchSingleOrderData = async (OrderId) => {
    const OrderData = {}
    // Fetch Address
    const docRef = doc(db, 'Orders', OrderId);
    const docSnap = await getDoc(docRef);
    let MetaData = null;
    if (docSnap.exists()) {
        MetaData = docSnap.data();
        OrderData.MetaData = MetaData;
    } else {
        console.log('No such document!');
    }

    // Fetch Products

    const querySnapshot = await getDocs(
        collection(db, 'Orders', OrderId, 'Products')
    );
    const Products = []
    querySnapshot.forEach((doc) => {
        const Product = {}
        Product[doc.id] = doc.data()
        Products.push(Product)
    });
    OrderData.Products = Products
    return OrderData;
};


