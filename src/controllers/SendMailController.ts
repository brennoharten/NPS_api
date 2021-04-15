import { Request, Response } from 'express';
import {resolve} from 'path';
import { getCustomRepository } from 'typeorm';
import { SurveysUsersRepository } from '../repositories/ServeysUsersRepository';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';


class SendMailController {

    async execute(request:Request, response: Response) {
        const {email, survey_id} = request.body;
        
        const usersRepository = getCustomRepository(UsersRepository)
        const surveysRepository = getCustomRepository(SurveysRepository)
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository)

        const theuser = await usersRepository.findOne({
            email
        })

        if(!theuser) {
            return response.status(400).json({
                error: "User does not exists!",
            })
        }

        const survey = await surveysRepository.findOne({
            id: survey_id
        })

        if(!survey) {
            return response.status(400).json({
                error: "survey does not exists!",
            })
        }

        const npsPath =  resolve(__dirname, "..", "views", "emails", "npsMail.hbs")
        
        const variables = {
            name: theuser.name,
            title: survey.title,
            description: survey.description, 
            user_id: theuser.id,
            link: process.env.URL_MAIL
        }

        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: [{user_id: theuser.id}, {value: null}],
            relations: ["user", "survey"]
        })

        if (surveyUserAlreadyExists){
            await SendMailService.execute(email,survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists);
        }

        //salvar as informações na tabela 
        const surveyUser = surveysUsersRepository.create({
            user_id: theuser.id,
            survey_id
        })

        await surveysUsersRepository.save(surveyUser)

        await SendMailService.execute(email,survey.title, variables, npsPath);

        return response.status(201).json(surveyUser)
    }
}


export { SendMailController };