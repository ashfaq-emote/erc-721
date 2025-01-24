const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Non Fungible_Token Tests', () => {

    /**
     * Fixture to deploy and snapshot Non Fungible_Token Contract state
     */
    const deployNonFungible_Token = async () => {
        const signers       = await ethers.getSigners();
        const owner         = signers[0];
        const otherSigners  = signers.splice(1);
        const TokenFactory  = await ethers.getContractFactory('NonFungibleToken');
        const TokenContract = await TokenFactory.deploy();

        return {owner, otherSigners, TokenContract};
    }

    describe('Deployment', async () => {

        it('Owner should match deployer address', async () => {
            const {owner, TokenContract} = await loadFixture(deployNonFungible_Token);
            const TokenOwner = await TokenContract.whoOwnsToken();
            expect(owner.address).to.equal(TokenOwner);
        })

    });

    describe('Token Minting Baseline Tests', async () => {


        it('Non Owner/Admins shouldnt be able to mint tokens', async () => {
            const {otherSigners, TokenContract} = await loadFixture(deployNonFungible_Token);
            await expect(TokenContract.connect(otherSigners[0]).mintToken(otherSigners[0].address, 1, '0x'))
                    .to.be.revertedWith('This function is encumbered to OWNER and ADMIN(S)')
        })

        it('Owner should be able to mint tokens', async () => { 
            const {owner, otherSigners, TokenContract} = await loadFixture(deployNonFungible_Token);
            await TokenContract.connect(owner).mintToken(otherSigners[0].address, 1, '0x')
            let tokenBalance = await TokenContract.balanceOf(otherSigners[0].address);
            expect(tokenBalance).to.equal(1);
        })

        it('Owner should be able to add admin', async () => {
            const {owner, otherSigners, TokenContract} = await loadFixture(deployNonFungible_Token);
            await expect(TokenContract.connect(owner).addAdmin(otherSigners[0].address))
                    .not.to.be.reverted;
        })

        it('Contract should recognize previous address as admin', async () => {
            const {owner, otherSigners, TokenContract} = await loadFixture(deployNonFungible_Token);
            await TokenContract.connect(owner).addAdmin(otherSigners[0].address);
            const TokenAdminStatus = await TokenContract.connect(otherSigners[0]).isSignerAdmin();
            expect(TokenAdminStatus).to.be.true;
        })

        it('Admin addition should emit adminModified event', async () => {
            const {owner, otherSigners, TokenContract} = await loadFixture(deployNonFungible_Token);
            await expect(TokenContract.connect(owner).addAdmin(otherSigners[0].address))
                    .to.emit(TokenContract, 'adminModified');
        })

        it('Admin should be able to add admin', async () => {
            const {owner, otherSigners, TokenContract} = await loadFixture(deployNonFungible_Token);
            await TokenContract.connect(owner).addAdmin(otherSigners[0].address)
            await TokenContract.connect(otherSigners[0]).addAdmin(otherSigners[1].address)
            const TokenAdminStatus = await TokenContract.connect(otherSigners[1]).isSignerAdmin();
            expect(TokenAdminStatus).to.be.true;
        })

        it('Admin should be able to remove admin', async () => {
            const {owner, otherSigners, TokenContract} = await loadFixture(deployNonFungible_Token);
            await TokenContract.connect(owner).addAdmin(otherSigners[0].address)
            await TokenContract.connect(otherSigners[0]).addAdmin(otherSigners[1].address)
            await TokenContract.connect(otherSigners[0]).removeAdmin(otherSigners[1].address)
            const TokenAdminStatus = await TokenContract.connect(otherSigners[1]).isSignerAdmin();
            expect(TokenAdminStatus).to.be.false;
        })

        it('Admin shouldnt be able to remove self', async () => {
            const {owner, otherSigners, TokenContract} = await loadFixture(deployNonFungible_Token);
            await TokenContract.connect(owner).addAdmin(otherSigners[0].address)
            await expect(TokenContract.connect(otherSigners[0]).removeAdmin(otherSigners[0].address))
                    .to.be.revertedWith('Self Reflection not permitted');
        })

    });

})