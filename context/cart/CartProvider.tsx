import { FC, PropsWithChildren, useEffect, useReducer } from 'react';
import Cookie from 'js-cookie';
import axios from 'axios';

import { ICartProduct, IOrder, ShippingAddress } from '../../interfaces';
import { CartContext, cartReducer } from './';
import { OrderSummary } from '../../components/cart/OrderSummary';
import { env } from 'process';
import Cookies from 'js-cookie';
import { oasisApi } from '../../axiosApi';



export interface CartState {
    isLoaded: boolean;
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
    shippingAddress?: ShippingAddress;
}

const CART_INITIAL_STATE: CartState = {
    isLoaded: false,
    cart: [],
    numberOfItems: 0,
    subTotal: 0,
    tax: 0,
    total: 0,
    shippingAddress: undefined
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
        if (Cookies.get('firstName')) {
            const shippingAddress = {
                firstName: Cookies.get('firstName') || '',
                lastName: Cookies.get('lastName') || '',
                address: Cookies.get('address') || '',
                address2: Cookies.get('address2') || '',
                zip: Cookies.get('zip') || '',
                city: Cookies.get('city') || '',
                country: Cookies.get('country') || '',
                phone: Cookies.get('phone') || '',
            }

            dispatch({
                type: 'Cart - LoadAddress from Cookies',
                payload: shippingAddress
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

    const updateAddress = (address: ShippingAddress) => {
        Cookies.set('firstName', address.firstName);
        Cookies.set('lastName', address.lastName);
        Cookies.set('address', address.address);
        Cookies.set('address2', address.address2 || '');
        Cookies.set('zip', address.zip);
        Cookies.set('city', address.city);
        Cookies.set('country', address.country);
        Cookies.set('phone', address.phone);
        dispatch({
            type: 'Cart - Update Address',
            payload: address
        })
    }

    const createOrder = async (): Promise<{ hasError: boolean; message: string; }> => {

        if (!state.shippingAddress) {
            throw new Error("No hay direccion de entrega");
        }

        const bodyOrder: IOrder = {
            orderItems: state.cart.map(p => ({
                ...p,
                size: p.size!
            })),
            shippingAddress: state.shippingAddress,
            numberOfItems: state.numberOfItems,
            subTotal: state.subTotal,
            tax: state.tax,
            total: state.total,
            isPaid: false,
        }


        try {
            const { data } = await oasisApi.post<IOrder>('/orders', bodyOrder);

            //TODO: Dispatch
            dispatch({ type: 'Cart - Order complete' })

            return {
                hasError: false,
                message: data._id!
            }

        } catch (error) {

            if (axios.isAxiosError(error)) {
                const { message } = error.response?.data as { message: string }
                return {
                    hasError: true,
                    message: message
                }
            }
            return {
                hasError: true,
                message: 'Error no controlado,  hable con el administrador de pagina web'
            }

        }
    }

    return (
        <CartContext.Provider value={{
            ...state,
            //Methods
            addProductToCart,
            updateCartQuantity,
            removeCartProduct,
            updateAddress,

            //ORDERS
            createOrder
        }}>
            {children}
        </CartContext.Provider>
    )
}