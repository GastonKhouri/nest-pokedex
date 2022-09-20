import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';

import { InjectModel } from '@nestjs/mongoose';

import { PokeResponse } from './interfaces/poke-response.interface';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {



	constructor(
		@InjectModel( Pokemon.name )
		private readonly pokemonModel: Model<Pokemon>,
		private readonly http: AxiosAdapter
	) { }

	async executeSeed() {

		await this.pokemonModel.deleteMany();

		const data = await this.http.get<PokeResponse>( 'https://pokeapi.co/api/v2/pokemon?limit=650' );

		const pokemons = data.results.map( ( { name, url } ) => ( {
			name: name,
			no: +url.split( '/' )[ 6 ]
		} ) );

		await this.pokemonModel.insertMany( pokemons );

		return 'Seed executed successfully';

	}

}
