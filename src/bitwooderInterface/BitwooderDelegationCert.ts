import { isNumber, isPublicKeyHex, isSignature, optional, PublicKeyHex, Signature, _validateObject } from "../commonInterface/kacheryTypes"

type BitwooderDelegationCert = { // in the case where the authorized signer (not the signerId) has delegated authority to the signer
    payload: {
        expires: number // expiration date of the certificate
        attributes: any // JSON string of attributes - which capabilities are allowed
        delegatedSignerId: PublicKeyHex // needs to match the signerId
    }
    auth: BitwooderResourceAuth
}

export type BitwooderResourceAuth = {
    signerId: PublicKeyHex // the entity signing the payload (the payload is not included in the ResourceAuth)
    signature: Signature // the signature proving that the signer authorizes the payload
    delegationCertificate?: BitwooderDelegationCert
}

const isBitwooderDelegationCertificatePayload = (x: any) => {
    return _validateObject(x, {
        expires: isNumber,
        attributes: () => (true),
        delegatedSignerId: isPublicKeyHex
    })
}

export const isBitwooderDelegationCertificate = (x: any): x is BitwooderDelegationCert => {
    return _validateObject(x, {
        payload: isBitwooderDelegationCertificatePayload,
        auth: isBitwooderResourceAuth
    })
}

export const isBitwooderResourceAuth = (x: any): x is BitwooderResourceAuth => {
    return _validateObject(x, {
        signerId: isPublicKeyHex,
        signature: isSignature,
        delegationCertificate: optional(isBitwooderDelegationCertificate)
    })
}

export default BitwooderDelegationCert