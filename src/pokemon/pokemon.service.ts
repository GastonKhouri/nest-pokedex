import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {

	constructor(
		@InjectModel( Pokemon.name )
		private readonly pokemonModel: Model<Pokemon>,
	) { }

	async create( createPokemonDto: CreatePokemonDto ) {

		createPokemonDto.name = createPokemonDto.name.toLowerCase();

		try {

			const pokemon = await this.pokemonModel.create( createPokemonDto );
			return pokemon;

		} catch ( error ) {

			this.handleExceptions( error, 'Error creating pokemon - Check server logs' );

		}

	}

	async findAll() {
		return await this.pokemonModel.find();
	}

	async findOne( term: string ) {

		let pokemon: Pokemon;

		// Buscar por ID de pokemon
		if ( !isNaN( +term ) ) {
			pokemon = await this.pokemonModel.findOne( { no: term } );
		}

		// Buscar por ID de mongo
		if ( isValidObjectId( term ) ) {
			pokemon = await this.pokemonModel.findById( term );
		}

		// Buscar por nombre
		if ( !pokemon ) {
			pokemon = await this.pokemonModel.findOne( { name: term.toLowerCase().trim() } );
		}

		if ( !pokemon ) throw new NotFoundException( `Pokemon not found: ${ term }` );

		return pokemon;

	}

	async update( term: string, updatePokemonDto: UpdatePokemonDto ) {

		if ( updatePokemonDto.name ) {
			updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
		}

		try {

			let pokemon = await this.findOne( term );

			await pokemon.updateOne( updatePokemonDto );

			return { ...pokemon.toJSON(), ...updatePokemonDto };

		} catch ( error ) {

			this.handleExceptions( error, 'Error updating pokemon - Check server logs' );

		}

	}

	async remove( id: string ) {

		// const pokemon = await this.findOne( id );
		// await pokemon.deleteOne();

		const { deletedCount } = await this.pokemonModel.deleteOne( { _id: id } );

		if ( deletedCount === 0 ) throw new NotFoundException( `Pokemon not found: ${ id }` );

		return;

	}

	private handleExceptions( error: any, internalErrorMessage: string ) {

		if ( error.code === 11000 ) {
			throw new BadRequestException( `Pokemon already exists: ${ JSON.stringify( error.keyValue ) }` );
		}

		console.log( error );
		throw new InternalServerErrorException( internalErrorMessage );

	}

}
