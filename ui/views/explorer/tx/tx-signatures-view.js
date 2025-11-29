import React, {useState, useEffect} from 'react'
import {inspectTransactionSigners} from '@stellar-expert/tx-signers-inspector'
import {Keypair} from '@stellar/stellar-base'
import {
    BlockSelect,
    AccountAddress,
    InfoTooltip as Info,
    useDependantState,
    findKeysBySignatureHint,
    signatureHintToMask
} from '@stellar-expert/ui-framework'

/**
 * Verify signature with a candidate public key
 * This is used to resolve signer collisions (extremely rare)
 */
function verifySignatureWithKey(signature, txHash, candidatePubkey) {
    try {
        const keypair = Keypair.fromPublicKey(candidatePubkey)
        const sigBytes = signature.signature()
        return keypair.verify(txHash, sigBytes)
    } catch (e) {
        return false
    }
}

/**
 * Resolve signer collision by verifying signature with each candidate
 */
function resolveSignerCollision(signature, txHash, candidatePubkeys) {
    for (const pubkey of candidatePubkeys) {
        if (verifySignatureWithKey(signature, txHash, pubkey)) {
            return pubkey
        }
    }
    return null
}

export default function TxSignaturesView({parsedTx}) {
    const [verifiedSigners, setVerifiedSigners] = useState(new Map())
    const [{xdr, potentialSigners}, setPotentialSigners] = useDependantState(() => {
        let {tx} = parsedTx
        let feeAccount = tx.source

        if (tx.innerTransaction) { //inner tx inside a fee bump tx
            feeAccount = tx.feeSource
            tx = tx.innerTransaction
        }
        const sourceAccount = tx.source
        //check if the source account is the only signer
        if (tx.signatures.length === 1 && findKeysBySignatureHint(tx.signatures[0], [sourceAccount]).length) {
            return Promise.resolve().then(() => setPotentialSigners({
                xdr: tx,
                potentialSigners: [sourceAccount]
            }))
        }
        //fetch all possible transaction signers and proceed
        inspectTransactionSigners(tx)
            .then(schema => {
                const potential = schema.getAllPotentialSigners();
                [sourceAccount, feeAccount].map(acc => !potential.includes(acc) && potential.push(acc))
                setPotentialSigners({xdr: tx, potentialSigners: potential})
            })
        return {xdr: tx, potentialSigners: null, prop: 0}
    }, [parsedTx.id])

    return <div className="segment blank space">
        <h3>Signatures
            <Info link="https://www.stellar.org/developers/guides/concepts/multi-sig.html">The list of all
                cryptographic signatures applied to the transaction envelope. A transaction may be signed by
                up to 20 signers.</Info>
        </h3>
        <hr className="flare"/>
        {!potentialSigners ?
            <div className="loader"/> :
            xdr.signatures.map((signature, index) => {
                const sig = signature.signature().toString('base64')
                const hint = signature.hint()
                const possibleSigners = findKeysBySignatureHint(signature, potentialSigners)
                const sigKey = `${index}-${sig.substring(0, 16)}`

                // Resolve signer collision by verifying signature (extremely rare but possible)
                let resolvedSigner = verifiedSigners.get(sigKey)
                if (!resolvedSigner && possibleSigners.length > 1) {
                    // Try to resolve collision by verifying signature with each candidate
                    const txHash = xdr.hash()
                    resolvedSigner = resolveSignerCollision(signature, txHash, possibleSigners)
                    if (resolvedSigner) {
                        setVerifiedSigners(prev => new Map(prev).set(sigKey, resolvedSigner))
                    }
                }

                const pubkey = resolvedSigner || (possibleSigners.length === 1 ? possibleSigners[0] : null)
                
                const displayKey = pubkey ? (
                    <AccountAddress account={pubkey} chars={12}/>
                ) : (
                    'Signer ' + signatureHintToMask(hint).replace(/_+/g, '____')
                )

                return <div key={sig}>
                    {displayKey}: <BlockSelect wrap inline className="word-break text-small condensed">{sig}</BlockSelect>
                </div>
            })}
    </div>
}