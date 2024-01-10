import * as Actions from '../actions/ActionTypes'
const PartnerRegisterReducer = (state = { partner_online_status: 1, partner_name: undefined, partner_profile_picture: undefined, aadhar_picture: undefined, driving_licence_picture: undefined, partner_lat: undefined, partner_lng: undefined }, action) => {

    switch (action.type) {
        case Actions.UPDATE_PARTNER_LAT:
            return Object.assign({}, state, {
                partner_lat: action.data
            });
        case Actions.UPDATE_PARTNER_LNG:
            return Object.assign({}, state, {
                partner_lng: action.data
            });
        case Actions.UPDATE_PARTNER_PROFILE_PICTURE:
            return Object.assign({}, state, {
                partner_profile_picture: action.data
            });
        case Actions.UPDATE_AADHAR_PICTURE:
            return Object.assign({}, state, {
                aadhar_picture: action.data
            });
        case Actions.UPDATE_DRIVING_LICENCE_PICTURE:
            return Object.assign({}, state, {
                driving_licence_picture: action.data
            });
        case Actions.UPDATE_PARTNER_NAME:
            return Object.assign({}, state, {
                partner_name: action.data
            });
        case Actions.UPDATE_PARTNER_ONLINE_STATUS:
            return Object.assign({}, state, {
                partner_online_status: action.data
            });
        case Actions.RESET:
            return Object.assign({}, state, {
                partner_lat: undefined,
                partner_lng: undefined,
                partner_profile_picture: undefined,
                aadhar_picture: undefined,
                driving_licence_picture: undefined,
            });
        default:
            return state;
    }
}

export default PartnerRegisterReducer;


