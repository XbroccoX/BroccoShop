import { FC, PropsWithChildren, useEffect, useReducer } from 'react';
import Cookie from 'js-cookie';

import { ICartProduct } from '../../interfaces';
import { CartContext, cartReducer } from './';
import { OrderSummary } from '../../components/cart/OrderSummary';
import { env } from 'process';



export interface CartState {
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
}

const CART_INITIAL_STATE: CartState = {
    cart: [],
    numberOfItems: 0,
    subTotal: 0,
    tax: 0,
    total: 0,
}

export const CartProvider: FC<PropsWithChildren<CartState>> = ({ children }) => {

    const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE)

    //Efecto> leer de la cookie y que recargue el carrito

    useEffect(() => {

        try {
            const cookieProduct = Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : [];
            dispatch({
                type: 'Cart - LoadCart from cookies | storage',
                payload: cookieProduct
            })
        } catch (error) {
            dispatch({
                type: 'Cart - LoadCart from cookies | storage',
                payload: []
            })
        }


    }, [])

    useEffect(() => {
        Cookie.set('cart', JSON.stringify(state.cart));
    }, [state.cart]);

    useEffect(() => {
        const numberOfItems = state.cart.reduce((prev, current) => current.quantity + prev, 0);
        const subTotal = state.cart.reduce((prev, current) => (current.price * current.quantity) + prev, 0);
        const taxRate = Number(process.env.NEXT_PUBLIC_TAX_RATE);
        const orderSummary = {
            numberOfItems,
            subTotal,
            tax: subTotal * taxRate,
            total: subTotal + (subTotal * taxRate)

        }

        dispatch({ type: 'Cart - Update order summary', payload: orderSummary });

    }, [state.cart])





    const addProductToCart = (product: ICartProduct) => {

        const productsInCart = state.cart.some(item => item._id === product._id)
        if (!productsInCart) return dispatch({ type: 'Cart - Update products in cart', payload: [...state.cart, product] })

        const productInCartButDifferentSize = state.cart.some(item => item._id === product._id && item.size === product.size)
        if (!productInCartButDifferentSize) return dispatch({ type: 'Cart - Update products in cart', payload: [...state.cart, product] })

        //Acomular el Quantity del objeto

        const updatedProductByQuantity = state.cart.map(item => {
            if (item._id !== product._id) return item;
            if (item.size !== product.size) return item;

            //Actualizar cantidad

            item.quantity += product.quantity
            return item
        })

        dispatch({ type: 'Cart - Update products in cart', payload: updatedProductByQuantity })
    }

    const updateCartQuantity = (product: ICartProduct) => {
        dispatch({
            type: 'Cart - Change cart quantity',
            payload: product
        })
    }

    const removeCartProduct = (product: ICartProduct) => {
        dispatch({
            type: 'Cart - Remove product in cart',
            payload: product
        })
    }

    return (
        <CartContext.Provider value={{
            ...state,
            //Methods
            addProductToCart,
            updateCartQuantity,
            removeCartProduct
        }}>
            {children}
        </CartContext.Provider>
    )
}