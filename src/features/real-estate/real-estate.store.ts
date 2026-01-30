import { createStore } from 'redux';
import { RealEstateActionTypes, RealEstateState } from './real-estate.types';

const initialState: RealEstateState = {
    properties: [],
    totalValue: 0,
};

const realEstateReducer = (state = initialState, action: any): RealEstateState => {
    switch (action.type) {
        case RealEstateActionTypes.ADD_PROPERTY:
            return {
                ...state,
                properties: [...state.properties, action.payload],
                totalValue: state.totalValue + action.payload.value,
            };
        case RealEstateActionTypes.REMOVE_PROPERTY:
            const updatedProperties = state.properties.filter(property => property.id !== action.payload.id);
            const removedProperty = state.properties.find(property => property.id === action.payload.id);
            return {
                ...state,
                properties: updatedProperties,
                totalValue: state.totalValue - (removedProperty ? removedProperty.value : 0),
            };
        case RealEstateActionTypes.UPDATE_PROPERTY:
            const updatedPropertyList = state.properties.map(property =>
                property.id === action.payload.id ? { ...property, ...action.payload.data } : property
            );
            return {
                ...state,
                properties: updatedPropertyList,
                totalValue: updatedPropertyList.reduce((total, property) => total + property.value, 0),
            };
        default:
            return state;
    }
};

export const realEstateStore = createStore(realEstateReducer);