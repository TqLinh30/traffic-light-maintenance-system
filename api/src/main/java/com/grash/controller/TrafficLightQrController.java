package com.grash.controller;

import com.grash.dto.RequestShowDTO;
import com.grash.dto.trafficLight.TrafficLightQrRequestCreateDTO;
import com.grash.dto.trafficLight.TrafficLightQrResolveDTO;
import com.grash.mapper.RequestMapper;
import com.grash.model.Company;
import com.grash.model.Request;
import com.grash.service.RequestLifecycleService;
import com.grash.service.TrafficLightPointService;
import com.grash.utils.Helper;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/traffic-light-qr")
@Tag(name = "trafficLightQr")
@RequiredArgsConstructor
public class TrafficLightQrController {

    private final TrafficLightPointService trafficLightPointService;
    private final RequestLifecycleService requestLifecycleService;
    private final RequestMapper requestMapper;
    private final MessageSource messageSource;

    @GetMapping("/{qrPublicCode}")
    public TrafficLightQrResolveDTO resolve(@PathVariable String qrPublicCode) {
        return trafficLightPointService.resolveByQrPublicCode(qrPublicCode);
    }

    @PostMapping("/{qrPublicCode}/requests")
    public RequestShowDTO createRequest(@PathVariable String qrPublicCode,
                                        @Valid @RequestBody TrafficLightQrRequestCreateDTO requestDto) {
        Request request = trafficLightPointService.createRequestFromQr(qrPublicCode, requestDto);
        Company company = request.getCompany();
        String requesterName = requestDto.getContact() != null && !requestDto.getContact().isBlank()
                ? requestDto.getContact()
                : messageSource.getMessage("someone", null, Helper.getLocale(company));
        requestLifecycleService.onRequestCreation(request, company, requesterName);
        return requestMapper.toShowDto(request);
    }
}
