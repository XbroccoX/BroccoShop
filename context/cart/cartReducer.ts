import { ICartProduct } from '../../interfaces';
import { CartState, ShippingAddress } from './';
import Product from '../../models/Product';

type CartActionType =
    | { type: 'Cart - LoadCart from cookies | storage', payload: ICartProduct[] }
    | { type: 'Cart - Update products in cart', payload: ICartProduct[] }
    | { type: 'Cart - Change cart quantity', payload: ICartProduct }
    | { type: 'Cart - Remove product in cart', payload: ICartProduct }
    | { type: 'Cart - LoadAddress from Cookies', payload: ShippingAddress }
    | { type: 'Cart - Update Address', payload: ShippingAddress }
    | {
        type: 'Cart - Update order summary', payload: {
            numberOfItems: number;
            subTotal: number;
            tax: number;
            total: number;
        }
    }


export const cartReducer = (state: CartState, action: CartActionType): CartState => {

    switch (action.type) {
        case 'Cart - LoadCart from cookies | storage':
            return {
                ...state,
                isLoaded: true,
                cart: [...action.payload]
            }
        case 'Cart - Update products in cart':
            return {
                ...state,
                cart: [...action.payload]
            }
        case 'Cart - Change cart quantity':
            return {
                ...state,
                cart: state.cart.map(item => {
                    if (item._id !== action.payload._id) return item;
                    if (item.size !== action.payload.size) return item;
                    item.quantity = action.payload.quantity;
                    return item
                })
            }
        case 'Cart - Remove product in cart':
            return {
                ...state,
                cart: state.cart.filter(item => !(item._id === action.payload._id && item.size === action.payload.size))
            }
        case 'Cart - Update order summary':
            return {
                ...state,
                ...action.payload
            }
        case 'Cart - Update Address':
        case 'Cart - LoadAddress from Cookies':
            return {
                ...state,
                shippingAddress: action.payload
            }

        default:
            return state;
    }

}