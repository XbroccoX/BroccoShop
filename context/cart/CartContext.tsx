import { createContext } from 'react';
import { ICartProduct } from '../../interfaces';
import { ShippingAddress } from './';

interface ContextProps {
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
    isLoaded: boolean;
    shippingAddress?: ShippingAddress;
    //Methods
    addProductToCart: (product: ICartProduct) => void;
    updateCartQuantity: (product: ICartProduct) => void;
    removeCartProduct: (product: ICartProduct) => void;
    updateAddress: (address: ShippingAddress) => void;

}
export const CartContext = createContext({} as ContextProps)